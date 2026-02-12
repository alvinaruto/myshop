import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
    try {
        const rates = await models.ExchangeRate.findAll({
            order: [['rate_date', 'DESC']],
            limit: 30
        });
        return NextResponse.json({ success: true, data: rates });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin' && auth.role !== 'manager') return forbiddenResponse();

        const data = await req.json();
        const today = new Date().toISOString().slice(0, 10);

        const [rate, created] = await models.ExchangeRate.findOrCreate({
            where: { rate_date: today },
            defaults: {
                ...data,
                rate_date: today,
                set_by: auth.userId
            }
        });

        if (!created) {
            await rate.update({ ...data, set_by: auth.userId });
        }

        return NextResponse.json({ success: true, data: rate });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
