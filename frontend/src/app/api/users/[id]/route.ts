import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        const user = await models.User.findByPk(params.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: (user as any).toJSON() });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        const user = await models.User.findByPk(params.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const data = await req.json();
        // Don't allow changing role if it's the current user (prevent lockout)
        if (auth.userId === params.id && data.role && data.role !== auth.role) {
            return NextResponse.json({ success: false, message: 'You cannot change your own role' }, { status: 400 });
        }

        await (user as any).update(data);
        return NextResponse.json({ success: true, data: (user as any).toJSON() });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        if (auth.userId === params.id) {
            return NextResponse.json({ success: false, message: 'You cannot delete yourself' }, { status: 400 });
        }

        const user = await models.User.findByPk(params.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        await (user as any).destroy();
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
