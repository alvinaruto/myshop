import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
    return NextResponse.json({ message: "OTP Verify endpoint is active. Use POST to verify a code." });
}

export async function POST(request: NextRequest) {
    try {
        const { phone, otp_code } = await request.json();

        if (!phone || !otp_code) {
            return NextResponse.json(
                { success: false, message: 'Phone and OTP are required' },
                { status: 400 }
            );
        }

        const customer = await models.CafeCustomer.findOne({
            where: { phone }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        const customerData = customer as any;

        // Verify OTP
        if (customerData.otp_code !== otp_code) {
            return NextResponse.json(
                { success: false, message: 'Invalid verification code' },
                { status: 401 }
            );
        }

        // Check expiry
        if (new Date() > new Date(customerData.otp_expiry)) {
            return NextResponse.json(
                { success: false, message: 'Verification code has expired' },
                { status: 401 }
            );
        }

        // Clear OTP after successful verification
        await customer.update({
            otp_code: null,
            otp_expiry: null
        });

        // Generate JWT Token
        const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
        const token = jwt.sign(
            {
                id: customerData.id,
                phone: customerData.phone,
                role: 'customer'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            message: 'Verification successful',
            data: {
                token,
                customer: {
                    id: customerData.id,
                    phone: customerData.phone,
                    name: customerData.name
                }
            }
        });

    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
