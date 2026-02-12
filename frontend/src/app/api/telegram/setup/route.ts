import { NextRequest, NextResponse } from 'next/server';

/**
 * Telegram Webhook Setup Endpoint
 * 
 * Use this to configure the webhook URL for your Telegram bot.
 * 
 * GET: Check current webhook status
 * POST: Set the webhook URL
 * DELETE: Remove the webhook
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }
    return token;
}

// GET - Check webhook info
export async function GET() {
    try {
        const token = getBotToken();
        const response = await fetch(`${TELEGRAM_API}${token}/getWebhookInfo`);
        const data = await response.json();

        return NextResponse.json({
            success: true,
            webhook_info: data.result,
            expected_url: 'https://myshop-ten-ruby.vercel.app/api/telegram/webhook'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST - Set webhook URL
export async function POST(request: NextRequest) {
    try {
        const token = getBotToken();
        const { searchParams } = new URL(request.url);

        // Use custom URL or default to production
        const webhookUrl = searchParams.get('url') || 'https://myshop-ten-ruby.vercel.app/api/telegram/webhook';

        const response = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: ['message']
            })
        });

        const data = await response.json();

        if (data.ok) {
            return NextResponse.json({
                success: true,
                message: 'Webhook set successfully',
                webhook_url: webhookUrl
            });
        } else {
            return NextResponse.json(
                { success: false, message: data.description },
                { status: 400 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove webhook
export async function DELETE() {
    try {
        const token = getBotToken();

        const response = await fetch(`${TELEGRAM_API}${token}/deleteWebhook`);
        const data = await response.json();

        return NextResponse.json({
            success: data.ok,
            message: data.ok ? 'Webhook removed' : data.description
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
