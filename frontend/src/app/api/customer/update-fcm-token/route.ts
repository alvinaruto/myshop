import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

/**
 * POST /api/customer/update-fcm-token
 * Updates the FCM token for a customer based on their phone number.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, fcm_token } = body;

        if (!phone || !fcm_token) {
            return NextResponse.json(
                { success: false, message: 'Phone and FCM token are required' },
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

        await (customer as any).update({ fcm_token });

        return NextResponse.json({
            success: true,
            message: 'FCM token updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating FCM token:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
