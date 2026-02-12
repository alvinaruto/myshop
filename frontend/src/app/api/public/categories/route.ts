import { NextResponse } from 'next/server';
import { models } from '@/lib/db';

export async function GET() {
    try {
        const categories = await models.Category.findAll({
            order: [['name', 'ASC']]
        });
        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
