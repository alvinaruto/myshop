import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const product_id = searchParams.get('product_id');
        const status = searchParams.get('status') || 'in_stock';

        const where: any = { status };
        if (product_id) where.product_id = product_id;

        const items = await models.SerialItem.findAll({
            where,
            include: [{ model: models.Product, as: 'product', attributes: ['name', 'image_url'] }],
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({ success: true, data: items });
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

        // Check for duplicates
        if (data.imei) {
            const existing = await models.SerialItem.findOne({ where: { imei: data.imei } });
            if (existing) return NextResponse.json({ success: false, message: 'IMEI already exists' }, { status: 400 });
        }
        if (data.serial_number) {
            const existing = await models.SerialItem.findOne({ where: { serial_number: data.serial_number } });
            if (existing) return NextResponse.json({ success: false, message: 'Serial Number already exists' }, { status: 400 });
        }

        const item = await models.SerialItem.create(data);
        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
