/**
 * Telegram Bot Integration Utility
 * 
 * Setup Instructions:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get the bot token and add to .env.local as TELEGRAM_BOT_TOKEN
 * 3. Create a group for order notifications
 * 4. Add the bot to the group
 * 5. Get the group chat ID (send a message, then visit:
 *    https://api.telegram.org/bot<TOKEN>/getUpdates)
 * 6. Add chat ID to .env.local as TELEGRAM_SHOP_CHAT_ID
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface TelegramConfig {
    botToken: string;
    shopChatId: string;
}

function getConfig(): TelegramConfig {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const shopChatId = process.env.TELEGRAM_SHOP_CHAT_ID;

    if (!botToken || !shopChatId) {
        throw new Error('Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_SHOP_CHAT_ID in .env.local');
    }

    return { botToken, shopChatId };
}

interface OrderItem {
    name: string;
    size?: string;
    quantity: number;
    unit_price: number;
    total: number;
    customizations?: Record<string, string>;
}

interface OrderData {
    order_number: string;
    customer_name?: string;
    customer_phone?: string;
    order_type?: 'dine_in' | 'takeaway';
    table_number?: number;
    items: OrderItem[];
    total_usd: number;
    notes?: string;
    created_at?: string;
}

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    try {
        const config = getConfig();
        const url = `${TELEGRAM_API_BASE}${config.botToken}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: parseMode,
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return false;
    }
}

/**
 * Format order details for Telegram message
 */
function formatOrderMessage(order: OrderData): string {
    const orderTime = order.created_at
        ? new Date(order.created_at).toLocaleString('en-US', {
            timeZone: 'Asia/Phnom_Penh',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        : new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Phnom_Penh',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

    let message = `🔔 <b>NEW ORDER</b> #${order.order_number.split('-').pop()}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;

    // Order type
    if (order.order_type === 'dine_in') {
        message += `🍽️ <b>Dine-In</b> - Table ${order.table_number || '?'}\n`;
    } else {
        message += `📦 <b>Takeaway</b>\n`;
    }

    // Customer info
    if (order.customer_name || order.customer_phone) {
        message += `👤 ${order.customer_name || 'Guest'}`;
        if (order.customer_phone) {
            message += ` • 📱 ${order.customer_phone}`;
        }
        message += '\n';
    }

    message += `⏰ ${orderTime}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Items
    message += `<b>📋 ORDER ITEMS:</b>\n`;
    for (const item of order.items) {
        const sizeLabel = item.size && item.size !== 'regular' ? ` (${item.size.toUpperCase()})` : '';
        message += `• ${item.quantity}x ${item.name}${sizeLabel} — $${item.total.toFixed(2)}\n`;

        // Customizations
        if (item.customizations && Object.keys(item.customizations).length > 0) {
            const customs = Object.entries(item.customizations)
                .filter(([_, v]) => v && v !== 'normal')
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            if (customs) {
                message += `  └ <i>${customs}</i>\n`;
            }
        }
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 <b>TOTAL: $${order.total_usd.toFixed(2)}</b>\n`;

    // Notes
    if (order.notes) {
        message += `\n📝 <b>Notes:</b> ${order.notes}`;
    }

    return message;
}

/**
 * Send new order notification to shop group
 */
export async function sendOrderNotification(order: OrderData): Promise<boolean> {
    try {
        const config = getConfig();
        const message = formatOrderMessage(order);
        return await sendTelegramMessage(config.shopChatId, message);
    } catch (error) {
        console.error('Failed to send order notification:', error);
        return false;
    }
}

/**
 * Send order status update to shop group
 */
export async function sendOrderStatusToGroup(
    orderNumber: string,
    status: 'preparing' | 'ready' | 'completed' | 'voided',
    customerName?: string
): Promise<boolean> {
    try {
        const config = getConfig();
        const shortOrderNum = orderNumber.split('-').pop();
        let message = '';

        switch (status) {
            case 'preparing':
                message = `☕ <b>Order #${shortOrderNum}</b> is now being prepared`;
                break;
            case 'ready':
                message = `🔔 <b>Order #${shortOrderNum}</b> is <b>READY FOR PICKUP!</b>`;
                break;
            case 'completed':
                message = `✅ <b>Order #${shortOrderNum}</b> has been picked up`;
                break;
            case 'voided':
                message = `❌ <b>Order #${shortOrderNum}</b> has been voided`;
                break;
        }

        if (customerName) {
            message += `\n👤 ${customerName}`;
        }

        return await sendTelegramMessage(config.shopChatId, message);
    } catch (error) {
        console.error('Failed to send order status to group:', error);
        return false;
    }
}

/**
 * Send order status update to customer
 */
export async function sendCustomerAlert(
    customerChatId: string,
    orderNumber: string,
    status: 'preparing' | 'ready' | 'completed'
): Promise<boolean> {
    let message = '';
    const shortOrderNum = orderNumber.split('-').pop();

    switch (status) {
        case 'preparing':
            message = `☕ <b>Order #${shortOrderNum}</b>\n\nYour order is now being prepared! We'll notify you when it's ready.`;
            break;
        case 'ready':
            message = `🎉 <b>Order #${shortOrderNum}</b>\n\n✅ Your order is <b>READY FOR PICKUP!</b>\n\nPlease come to the counter to collect your order.`;
            break;
        case 'completed':
            message = `✨ <b>Order #${shortOrderNum}</b>\n\nThank you for your order! We hope you enjoy your drinks. See you again soon! ☕`;
            break;
    }

    return await sendTelegramMessage(customerChatId, message);
}

/**
 * Check if Telegram is configured
 */
export function isTelegramConfigured(): boolean {
    return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_SHOP_CHAT_ID);
}
