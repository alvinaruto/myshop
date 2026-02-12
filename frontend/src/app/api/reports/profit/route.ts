import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();
        if (auth.role !== 'admin') return forbiddenResponse();

        const { searchParams } = new URL(req.url);
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');

        if (!start_date || !end_date) {
            return NextResponse.json({ success: false, message: 'start_date and end_date required' }, { status: 400 });
        }

        const saleItems = await models.SaleItem.findAll({
            include: [{
                model: models.Sale,
                as: 'sale',
                where: {
                    status: 'completed',
                    created_at: { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] }
                }
            }]
        });

        const totalRevenue = saleItems.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
        const totalCost = saleItems.reduce((sum: number, item: any) => sum + (parseFloat(item.cost_price || 0) * item.quantity), 0);
        const grossProfit = totalRevenue - totalCost;

        return NextResponse.json({
            success: true,
            data: {
                period: { start_date, end_date },
                totalRevenue: totalRevenue.toFixed(2),
                totalCost: totalCost.toFixed(2),
                grossProfit: grossProfit.toFixed(2),
                profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
