import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op, fn, col } from 'sequelize';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        // Only admin and manager can view staff performance
        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return forbiddenResponse();
        }

        const { searchParams } = new URL(req.url);
        const start_date = searchParams.get('start_date') || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
        const end_date = searchParams.get('end_date') || new Date().toISOString().slice(0, 10);

        // Get all users (cashiers)
        const users = await models.User.findAll({
            where: { is_active: true },
            attributes: ['id', 'username', 'full_name', 'role']
        });

        const performanceData = [];

        for (const user of users) {
            const userId = (user as any).id;
            const cashierData = (user as any).toJSON();

            // Get sales count and total for this user
            const salesData = await models.Sale.findAll({
                where: {
                    cashier_id: userId,
                    status: 'completed',
                    created_at: { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] }
                },
                attributes: [
                    [fn('COUNT', col('id')), 'total_sales'],
                    [fn('SUM', col('total_usd')), 'total_revenue']
                ],
                raw: true
            });

            const stats = salesData[0] as any;

            performanceData.push({
                cashier: cashierData,
                total_sales: parseInt(stats?.total_sales || '0'),
                total_revenue: parseFloat(stats?.total_revenue || '0')
            });
        }

        // Sort by total revenue descending
        performanceData.sort((a, b) => b.total_revenue - a.total_revenue);

        return NextResponse.json({
            success: true,
            data: performanceData
        });
    } catch (error: any) {
        console.error('Staff performance error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
