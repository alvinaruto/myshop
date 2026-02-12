import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        const users = await models.User.findAll({
            order: [['full_name', 'ASC']]
        });
        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        const data = await req.json();

        // Basic validation
        if (!data.username || data.username.length < 3) {
            return NextResponse.json({ success: false, message: 'Username must be at least 3 characters' }, { status: 400 });
        }

        // Accept both 'password' and 'password_hash' for flexibility
        const password = data.password || data.password_hash;
        if (!password || password.length < 6) {
            return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
        }

        if (!data.full_name) {
            return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 });
        }

        const existing = await models.User.findOne({ where: { username: data.username } });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
        }

        // Map password to password_hash for the model (hook will hash it)
        const userData = {
            ...data,
            password_hash: password
        };
        delete userData.password; // Remove password field if present

        const user = await models.User.create(userData);
        return NextResponse.json({ success: true, data: (user as any).toJSON() }, { status: 201 });
    } catch (error: any) {
        console.error('User creation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
