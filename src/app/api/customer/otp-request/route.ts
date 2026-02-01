import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

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

        // Log OTP for testing (Mock SMS)
        console.log(`[OTP] Verification code for ${phone}: ${otp}`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully (Check server logs)',
            data: { phone }
        });

    } catch (error: any) {
        console.error('Error requesting OTP:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
