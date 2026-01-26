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
            return NextResponse.json({ success: false, message: 'Username too short' }, { status: 400 });
        }
        if (!data.password_hash || data.password_hash.length < 6) {
            return NextResponse.json({ success: false, message: 'Password too short' }, { status: 400 });
        }

        const existing = await models.User.findOne({ where: { username: data.username } });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
        }

        const user = await models.User.create(data);
        return NextResponse.json({ success: true, data: user.toJSON() }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
