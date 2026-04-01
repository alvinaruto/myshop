import { NextRequest } from 'next/server';
import { models, getSequelize } from '@/lib/db';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getAnalyticsSnapshot() {
    const sequelize = getSequelize();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Today's completed + pending + preparing orders
    const allTodayOrders = await models.CafeOrder.findAll({
        where: {
            created_at: { [Op.gte]: todayStart },
            status: { [Op.notIn]: ['cancelled'] }
        },
        include: [{ model: models.CafeOrderItem, as: 'items' }],
        order: [['created_at', 'DESC']]
    });

    const totalRevenue = allTodayOrders.reduce((sum: number, o: any) => {
        return o.status === 'completed' ? sum + parseFloat(o.total_usd || 0) : sum;
    }, 0);

    const totalOrders = allTodayOrders.filter((o: any) => o.status === 'completed').length;
    const pendingOrders = allTodayOrders.filter((o: any) => ['pending', 'preparing', 'ready'].includes(o.status)).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Item popularity
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of allTodayOrders as any[]) {
        for (const item of (order.items || [])) {
            const name = item.name || 'Unknown';
            if (!itemCounts[name]) itemCounts[name] = { name, count: 0, revenue: 0 };
            itemCounts[name].count += item.quantity || 1;
            itemCounts[name].revenue += parseFloat(item.total || 0);
        }
    }
    const topItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Hourly breakdown (last 12 hours)
    const hourlyData: Array<{ hour: string; revenue: number; orders: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const hourStart = new Date(now);
        hourStart.setHours(now.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourStart.getHours() + 1, 0, 0, 0);

        const hourOrders = (allTodayOrders as any[]).filter(o => {
            const t = new Date(o.createdAt || o.created_at);
            return t >= hourStart && t < hourEnd && o.status === 'completed';
        });

        const label = `${hourStart.getHours()}:00`;
        hourlyData.push({
            hour: label,
            revenue: hourOrders.reduce((s: number, o: any) => s + parseFloat(o.total_usd || 0), 0),
            orders: hourOrders.length
        });
    }

    // Customer count
    const uniqueCustomers = new Set(
        (allTodayOrders as any[])
            .filter(o => o.customer_id)
            .map(o => o.customer_id)
    ).size;

    return {
        totalRevenue,
        totalOrders,
        pendingOrders,
        avgOrderValue,
        topItems,
        hourlyData,
        uniqueCustomers,
        timestamp: new Date().toISOString()
    };
}

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let running = true;

            const heartbeat = setInterval(() => {
                if (!running) return;
                try { controller.enqueue(encoder.encode(': heartbeat\n\n')); } catch { }
            }, 20000);

            const sendStats = async () => {
                if (!running) return;
                try {
                    const stats = await getAnalyticsSnapshot();
                    const payload = JSON.stringify({ type: 'analytics', data: stats });
                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                } catch (err) {
                    console.error('[SSE analytics] Error:', err);
                }

                if (running) setTimeout(sendStats, 10000);
            };

            await sendStats();

            request.signal.addEventListener('abort', () => {
                running = false;
                clearInterval(heartbeat);
                try { controller.close(); } catch { }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        }
    });
}
