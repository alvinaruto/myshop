import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin' && auth.role !== 'manager') return forbiddenResponse();

        const { searchParams } = new URL(req.url);
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');
        const where: any = { status: 'completed' };

        if (start_date && end_date) {
            where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] };
        }

        const performance = await models.Sale.findAll({
            attributes: [
                'cashier_id',
                [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'total_sales'],
                [sequelize.fn('SUM', sequelize.col('total_usd')), 'total_revenue']
            ],
            where,
            include: [{ model: models.User, as: 'cashier', attributes: ['id', 'full_name'] }],
            group: ['cashier_id', 'cashier.id'],
            order: [[sequelize.literal('total_revenue'), 'DESC']]
        });

        return NextResponse.json({ success: true, data: performance });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
