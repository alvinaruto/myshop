import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        // Find user
        const user: any = await models.User.findOne({ where: { username } });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Invalid username or password'
            }, { status: 401 });
        }

        // Check if user is active
        if (!user.is_active) {
            return NextResponse.json({
                success: false,
                message: 'Account is disabled. Contact administrator.'
            }, { status: 401 });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                message: 'Invalid username or password'
            }, { status: 401 });
        }

        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: expiresIn as any }
        );

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                user: (user as any).toJSON(),
                token,
                expiresIn
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
