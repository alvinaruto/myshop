import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

/**
 * Telegram Webhook Handler
 * 
 * This is a simplified version that just responds to messages.
 * Full customer linking functionality requires database migrations.
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

        // Check if it's a /start command
        if (text === '/start') {
            await sendTelegramMessage(
                chatId,
                `👋 <b>Welcome to myShop Coffee!</b>\n\n` +
                `Thank you for connecting! This bot will notify you when your orders are ready.\n\n` +
                `To place an order, visit our menu page and enter your phone number at checkout.`
            );
            return NextResponse.json({ ok: true });
        }

        // Default response
        await sendTelegramMessage(
            chatId,
            `☕ <b>myShop Coffee</b>\n\n` +
            `Visit our menu to place an order! You'll receive notifications about your order status.`
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
