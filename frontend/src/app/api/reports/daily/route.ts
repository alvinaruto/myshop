import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin' && auth.role !== 'manager') return forbiddenResponse();

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
        const start_date = new Date(date);
        const end_date = new Date(start_date.getTime() + 86400000);

        const sales = await models.Sale.findAll({
            where: {
                status: 'completed',
                created_at: { [Op.gte]: start_date, [Op.lt]: end_date }
            },
            include: [{ model: models.User, as: 'cashier', attributes: ['id', 'full_name'] }]
        });

        const summary = {
            date,
            totalSales: sales.length,
            totalUsd: sales.reduce((sum: number, s: any) => sum + parseFloat(s.total_usd), 0),
            totalPaidUsd: sales.reduce((sum: number, s: any) => sum + parseFloat(s.paid_usd), 0),
            totalPaidKhr: sales.reduce((sum: number, s: any) => sum + parseFloat(s.paid_khr), 0),
            byPaymentMethod: {
                cash: sales.filter((s: any) => s.payment_method === 'cash').length,
                card: sales.filter((s: any) => s.payment_method === 'card').length,
                khqr: sales.filter((s: any) => s.payment_method === 'khqr').length,
                split: sales.filter((s: any) => s.payment_method === 'split').length
            }
        };

        return NextResponse.json({ success: true, data: { summary, sales } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
