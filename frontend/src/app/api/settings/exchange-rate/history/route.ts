import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Get exchange rate history for the last N days
        const rates = await models.ExchangeRate.findAll({
            order: [['rate_date', 'DESC']],
            limit: days,
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name']
                }
            ]
        });

        return NextResponse.json({
            success: true,
            data: rates
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
