import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/reports - Get café analytics data
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'today'; // today, week, month

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            default: // today
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        // Get orders in the period (include all statuses except voided)
        const orders = await models.CafeOrder.findAll({
            where: {
                status: { [Op.notIn]: ['voided'] },
                created_at: { [Op.gte]: startDate }
            },
            include: [{
                model: models.CafeOrderItem,
                as: 'items',
                include: [{
                    model: models.MenuItem,
                    as: 'menuItem',
                    include: [{
                        model: models.MenuCategory,
                        as: 'category'
                    }]
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        // Calculate metrics
        const totalRevenue = orders.reduce((sum: number, order: any) => {
            const orderTotal = parseFloat(order.totalUsd || order.total_usd || 0);
            // If order total is 0, sum the items as a fallback
            if (orderTotal === 0 && order.items && order.items.length > 0) {
                const itemsSum = order.items.reduce((itemSum: number, item: any) => {
                    return itemSum + parseFloat(item.total || 0);
                }, 0);
                return sum + itemsSum;
            }
            return sum + orderTotal;
        }, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get yesterday's revenue for comparison
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayOrders = await models.CafeOrder.findAll({
            where: {
                status: 'completed',
                created_at: { [Op.between]: [yesterdayStart, yesterdayEnd] }
            }
        });
        const yesterdayRevenue = yesterdayOrders.reduce((sum: number, order: any) => {
            const amount = order.totalUsd || order.total_usd || 0;
            return sum + parseFloat(amount as any);
        }, 0);

        // Top selling items
        const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        orders.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const key = item.menuItemId || item.menu_item_id;
                if (!itemSales[key]) {
                    itemSales[key] = {
                        name: item.menuItem?.name || item.name || 'Unknown',
                        quantity: 0,
                        revenue: 0
                    };
                }
                itemSales[key].quantity += item.quantity;
                itemSales[key].revenue += parseFloat(item.total || 0);
            });
        });
        const topItems = Object.values(itemSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        // Sales by category
        const categorySales: Record<string, { name: string; revenue: number; count: number }> = {};
        orders.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const categoryName = item.menuItem?.category?.name || 'Uncategorized';
                if (!categorySales[categoryName]) {
                    categorySales[categoryName] = { name: categoryName, revenue: 0, count: 0 };
                }
                const itemTotal = item.total || 0;
                categorySales[categoryName].revenue += parseFloat(itemTotal as any);
                categorySales[categoryName].count += (item.quantity || 0);
            });
        });

        // Sales by hour (for today)
        const hourlyData: Record<number, number> = {};
        for (let h = 6; h <= 22; h++) hourlyData[h] = 0;

        if (period === 'today') {
            orders.forEach((order: any) => {
                const date = order.createdAt || order.created_at;
                const hour = new Date(date).getHours();
                if (!isNaN(hour)) {
                    let amount = parseFloat(order.totalUsd || order.total_usd || 0);
                    // Fallback to items if order total is 0
                    if (amount === 0 && order.items && order.items.length > 0) {
                        amount = order.items.reduce((s: number, i: any) => s + parseFloat(i.total || 0), 0);
                    }
                    hourlyData[hour] = (hourlyData[hour] || 0) + amount;
                }
            });
        }

        // Sales by day (for week/month)
        const dailyData: { date: string; revenue: number }[] = [];
        if (period !== 'today') {
            const ordersByDay: Record<string, number> = {};
            orders.forEach((order: any) => {
                const date = order.createdAt || order.created_at;
                const dateStr = new Date(date).toISOString().split('T')[0];
                const amount = order.totalUsd || order.total_usd || 0;
                ordersByDay[dateStr] = (ordersByDay[dateStr] || 0) + parseFloat(amount as any);
            });
            Object.entries(ordersByDay)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([date, revenue]) => {
                    dailyData.push({ date, revenue });
                });
        }

        // Payment method breakdown
        const paymentMethods: Record<string, number> = { cash: 0, card: 0, khqr: 0, split: 0 };
        orders.forEach((order: any) => {
            const method = order.paymentMethod || order.payment_method || 'cash';
            const amount = order.totalUsd || order.total_usd || 0;
            paymentMethods[method] = (paymentMethods[method] || 0) + parseFloat(amount as any);
        });

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    avgOrderValue,
                    yesterdayRevenue,
                    revenueChange: yesterdayRevenue > 0
                        ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
                        : 0
                },
                topItems,
                categorySales: Object.values(categorySales),
                hourlyData: Object.entries(hourlyData).map(([hour, revenue]) => ({
                    hour: parseInt(hour),
                    revenue
                })),
                dailyData,
                paymentMethods
            }
        });
    } catch (error: any) {
        console.error('Reports error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
