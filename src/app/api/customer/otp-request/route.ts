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
        // We only select essential fields to avoid errors if some columns are missing from the schema (e.g. loyalty_points)
        const essentialFields = ['id', 'phone', 'otp_code', 'otp_expiry'];
        let customer = await models.CafeCustomer.findOne({
            where: { phone },
            attributes: essentialFields as any
        });

        if (!customer) {
            customer = await models.CafeCustomer.create({
                phone,
                otp_code: otp,
                otp_expiry: expiry
            }, {
                fields: ['phone', 'otp_code', 'otp_expiry'] as any
            });
        } else {
            await customer.update({
                otp_code: otp,
                otp_expiry: expiry
            }, {
                fields: ['otp_code', 'otp_expiry'] as any
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
