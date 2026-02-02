import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
    return NextResponse.json({ message: "OTP Request endpoint is active. Use POST to request a code." });
}

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // Find or create customer
        let customer = await models.CafeCustomer.findOne({
            where: { phone }
        });

        if (!customer) {
            customer = await models.CafeCustomer.create({
                phone,
                otp_code: otp,
                otp_expiry: expiry
            });
        } else {
            await customer.update({
                otp_code: otp,
                otp_expiry: expiry
            });
        }

        // Log OTP for testing
        console.log(`[OTP] Verification code for ${phone}: ${otp}`);

        // Try to send via Telegram if linked
        let telegramSent = false;
        const botUsername = 'myshop_coffee_bot'; // Replace with actual bot username
        const botUrl = `https://t.me/${botUsername}`;
        const customerAny = customer as any;

        if (customerAny.telegram_chat_id) {
            const message = `🔐 <b>Verification Code</b>\n\nYour myShop OTP is: <code>${otp}</code>\n\nValid for 5 minutes.`;
            telegramSent = await sendTelegramMessage(customerAny.telegram_chat_id, message);
        }

        return NextResponse.json({
            success: true,
            message: telegramSent ? 'OTP sent via Telegram' : 'OTP generated (Link Telegram for real delivery)',
            data: {
                phone,
                telegram_linked: !!customerAny.telegram_chat_id,
                bot_url: botUrl
            }
        });

    } catch (error: any) {
        console.error('Error requesting OTP:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message,
                detail: error.original?.message || error.parent?.message || 'No additional detail',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
