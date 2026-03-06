import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyCustomerAuth } from '@/lib/auth';

/**
 * GET /api/customer/loyalty
 * Returns the authenticated customer's loyalty points, tier, and history.
 */
export async function GET(request: NextRequest) {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const customer = await models.CafeCustomer.findByPk((auth as any).id);

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        const c = customer as any;

        // Tier thresholds
        const TIERS = {
            bronze: { min: 0, max: 49, next: 'silver', nextMin: 50 },
            silver: { min: 50, max: 199, next: 'gold', nextMin: 200 },
            gold: { min: 200, max: 499, next: 'platinum', nextMin: 500 },
            platinum: { min: 500, max: Infinity, next: null, nextMin: null },
        };

        const tier = c.tier || 'bronze';
        const tierInfo = TIERS[tier as keyof typeof TIERS] || TIERS.bronze;
        const pointsToNext = tierInfo.nextMin !== null ? tierInfo.nextMin - (c.loyalty_points || 0) : 0;

        // Recent orders with points earned
        const recentOrders = await models.CafeOrder.findAll({
            where: { customer_id: c.id, status: 'completed' },
            include: [{ model: models.CafeOrderItem, as: 'items' }],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        const history = (recentOrders as any[]).map(o => ({
            id: o.id,
            order_number: o.order_number,
            date: o.createdAt || o.created_at,
            amount: parseFloat(o.total_usd || 0),
            points_earned: Math.floor(parseFloat(o.total_usd || 0)),
        }));

        return NextResponse.json({
            success: true,
            data: {
                id: c.id,
                phone: c.phone,
                name: c.name,
                loyalty_points: c.loyalty_points || 0,
                total_spent: parseFloat(c.total_spent || 0),
                total_orders: c.total_orders || 0,
                last_visit: c.last_visit,
                tier,
                tier_info: {
                    current: tier,
                    next: tierInfo.next,
                    points_to_next: Math.max(0, pointsToNext),
                    progress_percent: tierInfo.nextMin
                        ? Math.min(100, Math.round(((c.loyalty_points || 0) - tierInfo.min) / (tierInfo.nextMin - tierInfo.min) * 100))
                        : 100
                },
                recent_history: history
            }
        });
    } catch (error: any) {
        console.error('[loyalty] Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
