import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const brands = await models.Brand.findAll({
            order: [['name', 'ASC']]
        });
        return NextResponse.json({ success: true, data: brands });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });
        }

        const data = await req.json();
        const brand = await models.Brand.create(data);
        return NextResponse.json({ success: true, data: brand }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
