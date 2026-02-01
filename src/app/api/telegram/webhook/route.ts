import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

/**
 * Telegram Webhook Handler
 * 
 * This endpoint processes incoming messages from Telegram.
 * When a customer sends their phone number, it links their Telegram account.
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
        const userName = message.from.first_name + (message.from.last_name ? ' ' + message.from.last_name : '');

        // Check if it's a /start command
        if (text === '/start') {
            await sendTelegramMessage(
                chatId,
                `👋 <b>Welcome to myShop Coffee!</b>\n\n` +
                `To receive order notifications, please send your phone number.\n\n` +
                `Example: <code>012345678</code>\n\n` +
                `Once linked, you'll receive alerts when:\n` +
                `• Your order is being prepared\n` +
                `• Your order is ready for pickup`
            );
            return NextResponse.json({ ok: true });
        }

        // Check if it's a phone number (Cambodian format)
        const phoneRegex = /^0?\d{8,10}$/;
        const cleanPhone = text.replace(/[\s\-\(\)]/g, '');

        if (phoneRegex.test(cleanPhone)) {
            // Normalize phone number (ensure it starts with 0)
            const normalizedPhone = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;

            // Find customer by phone
            const customer = await models.CafeCustomer.findOne({
                where: { phone: normalizedPhone }
            });

            if (customer) {
                // Link Telegram chat ID to customer
                await customer.update({ telegram_chat_id: chatId });

                await sendTelegramMessage(
                    chatId,
                    `✅ <b>Phone number linked successfully!</b>\n\n` +
                    `Hi ${(customer as any).name || 'there'}! Your Telegram account is now connected to phone number <b>${normalizedPhone}</b>.\n\n` +
                    `You will now receive notifications about your orders at myShop Coffee! ☕`
                );
            } else {
                // Create a new customer with this phone and link Telegram
                await models.CafeCustomer.create({
                    phone: normalizedPhone,
                    name: userName,
                    telegram_chat_id: chatId
                });

                await sendTelegramMessage(
                    chatId,
                    `✅ <b>Account created and linked!</b>\n\n` +
                    `Welcome, ${userName}! We've created an account for you with phone number <b>${normalizedPhone}</b>.\n\n` +
                    `You will now receive notifications about your orders at myShop Coffee! ☕`
                );
            }

            return NextResponse.json({ ok: true });
        }

        // Check if it's a /status command
        if (text.startsWith('/status')) {
            // Find customer by chat ID
            const customer = await models.CafeCustomer.findOne({
                where: { telegram_chat_id: chatId }
            });

            if (!customer) {
                await sendTelegramMessage(
                    chatId,
                    `⚠️ Your Telegram is not linked to any phone number.\n\n` +
                    `Please send your phone number to link your account.`
                );
                return NextResponse.json({ ok: true });
            }

            // Get their active orders
            const orders = await models.CafeOrder.findAll({
                where: {
                    customer_id: (customer as any).id,
                    status: ['pending', 'preparing', 'ready']
                },
                order: [['created_at', 'DESC']],
                limit: 5
            });

            if (orders.length === 0) {
                await sendTelegramMessage(
                    chatId,
                    `📋 <b>No active orders</b>\n\n` +
                    `You don't have any orders in progress. Visit our menu to place an order!`
                );
            } else {
                let statusMessage = `📋 <b>Your Active Orders:</b>\n\n`;
                for (const order of orders) {
                    const orderNum = (order as any).order_number.split('-').pop();
                    const status = (order as any).status;
                    const statusEmoji = status === 'ready' ? '✅' : status === 'preparing' ? '☕' : '⏳';
                    statusMessage += `${statusEmoji} Order #${orderNum}: <b>${status.toUpperCase()}</b>\n`;
                }
                await sendTelegramMessage(chatId, statusMessage);
            }

            return NextResponse.json({ ok: true });
        }

        // Unknown command - show help
        await sendTelegramMessage(
            chatId,
            `ℹ️ <b>How to use this bot:</b>\n\n` +
            `• Send your <b>phone number</b> to link your account\n` +
            `• Send <b>/status</b> to check your active orders\n` +
            `• Send <b>/start</b> to see welcome message`
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
