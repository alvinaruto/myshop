import { NextResponse } from 'next/server';
import { models } from '@/lib/db';

export async function GET() {
    try {
        const brands = await models.Brand.findAll({
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
        return NextResponse.json({ success: true, data: brands });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
