import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { models } from '@/lib/db';

/**
 * Telegram Webhook Handler
 * 
 * Handles customer phone linking and bot commands.
 * 
 * To set up the webhook, use:
 * https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
 */

interface TelegramMessage {
    message_id: number;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
    };
    chat: {
        id: number;
        type: string;
    };
    text?: string;
    date: number;
}

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

// Simple phone number validation (Cambodian format or international)
function isPhoneNumber(text: string): boolean {
    // Remove spaces and dashes
    const cleaned = text.replace(/[\s-]/g, '');
    // Match Cambodian numbers (0XX...) or international (+855...)
    return /^(0\d{8,9}|\+855\d{8,9})$/.test(cleaned);
}

function normalizePhone(text: string): string {
    return text.replace(/[\s-]/g, '');
}

// POST /api/telegram/webhook - Handle incoming Telegram updates
export async function POST(request: NextRequest) {
    try {
        const update: TelegramUpdate = await request.json();

        // Only process private messages
        if (!update.message || update.message.chat.type !== 'private') {
            return NextResponse.json({ ok: true });
        }

        const message = update.message;
        const chatId = message.chat.id.toString();
        const text = message.text?.trim() || '';
        const firstName = message.from.first_name;

        // Check if it's a /start command
        if (text === '/start') {
            await sendTelegramMessage(
                chatId,
                `👋 <b>Welcome to myShop Coffee, ${firstName}!</b>\n\n` +
                `This bot will notify you when your orders are ready for pickup.\n\n` +
                `<b>To get started:</b>\n` +
                `📱 Send your phone number (e.g., 0962027535)\n\n` +
                `Once linked, you'll receive instant notifications when your coffee is ready! ☕`
            );
            return NextResponse.json({ ok: true });
        }

        // Check if it's a phone number
        if (isPhoneNumber(text)) {
            const phone = normalizePhone(text);

            try {
                // Find customer by phone
                const customer = await models.CafeCustomer.findOne({
                    where: { phone }
                });

                if (customer) {
                    // Link Telegram chat ID to customer
                    await customer.update({ telegram_chat_id: chatId });

                    await sendTelegramMessage(
                        chatId,
                        `✅ <b>Phone linked successfully!</b>\n\n` +
                        `Hi ${(customer as any).name || firstName}! Your phone number <b>${phone}</b> is now connected.\n\n` +
                        `You'll receive notifications when your orders are:\n` +
                        `☕ Being prepared\n` +
                        `🎉 Ready for pickup\n\n` +
                        `Enjoy your coffee! ☕`
                    );
                } else {
                    // Customer doesn't exist yet - create one with telegram linked
                    await models.CafeCustomer.create({
                        phone,
                        name: firstName,
                        telegram_chat_id: chatId
                    });

                    await sendTelegramMessage(
                        chatId,
                        `✅ <b>Account created!</b>\n\n` +
                        `Welcome ${firstName}! Your phone number <b>${phone}</b> is now registered.\n\n` +
                        `Next time you order at myShop Coffee, use this phone number and you'll get instant notifications! 🔔`
                    );
                }
            } catch (dbError) {
                console.error('Database error linking phone:', dbError);
                await sendTelegramMessage(
                    chatId,
                    `❌ Sorry, there was an issue linking your phone. Please try again later.`
                );
            }

            return NextResponse.json({ ok: true });
        }

        // Help command
        if (text === '/help') {
            await sendTelegramMessage(
                chatId,
                `📖 <b>myShop Coffee Bot Help</b>\n\n` +
                `<b>Commands:</b>\n` +
                `/start - Welcome message\n` +
                `/help - Show this help\n` +
                `/status - Check if your phone is linked\n\n` +
                `<b>Link your phone:</b>\n` +
                `Just send your phone number (e.g., 0962027535)`
            );
            return NextResponse.json({ ok: true });
        }

        // Status command - check if phone is linked
        if (text === '/status') {
            const linkedCustomer = await models.CafeCustomer.findOne({
                where: { telegram_chat_id: chatId }
            });

            if (linkedCustomer) {
                await sendTelegramMessage(
                    chatId,
                    `✅ <b>Your account is linked!</b>\n\n` +
                    `Phone: ${(linkedCustomer as any).phone}\n` +
                    `Name: ${(linkedCustomer as any).name || 'Not set'}\n` +
                    `Total orders: ${(linkedCustomer as any).total_orders || 0}\n\n` +
                    `You'll receive notifications for your orders.`
                );
            } else {
                await sendTelegramMessage(
                    chatId,
                    `❌ <b>No phone linked</b>\n\n` +
                    `Send your phone number to link your account and receive order notifications.`
                );
            }
            return NextResponse.json({ ok: true });
        }

        // Default response
        await sendTelegramMessage(
            chatId,
            `☕ <b>myShop Coffee</b>\n\n` +
            `Send your phone number to link your account, or use /help for more options.`
        );

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('Telegram webhook error:', error);
        // Always return 200 to Telegram to prevent retries
        return NextResponse.json({ ok: true });
    }
}

// GET /api/telegram/webhook - Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Telegram webhook endpoint is active'
    });
}
