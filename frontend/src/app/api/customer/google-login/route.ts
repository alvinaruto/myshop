import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';
import '@/lib/fcm'; // Ensure firebase is initialized

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json(
                { success: false, message: 'ID Token is required' },
                { status: 400 }
            );
        }

        // Verify Firebase ID Token
        // Note: admin.auth().verifyIdToken(idToken) will verify that the token
        // is a valid Firebase ID token from your project.
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decodedToken;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email not found in Google account' },
                { status: 400 }
            );
        }

        // Find customer by email
        let customer = await models.CafeCustomer.findOne({
            where: { email }
        });

        // If not found by email, maybe search by name? (Not reliable)
        // Or if the user exists but has no email set, they might need to link it.

        if (!customer) {
            return NextResponse.json({
                success: false,
                code: 'NEW_USER',
                message: 'No account linked to this Google email.',
                data: { email, name, picture, google_id: uid }
            }, { status: 200 }); // Return 200 but with success: false and a specific code
        }

        const customerData = customer as any;

        // Generate JWT Token
        const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
        const token = jwt.sign(
            {
                id: customerData.id,
                phone: customerData.phone,
                role: 'customer'
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                customer: {
                    id: customerData.id,
                    phone: customerData.phone,
                    name: customerData.name,
                    email: customerData.email
                }
            }
        });

    } catch (error: any) {
        console.error('Error Google login:', error);
        return NextResponse.json(
            { success: false, message: 'Invalid or expired Google token' },
            { status: 401 }
        );
    }
}
