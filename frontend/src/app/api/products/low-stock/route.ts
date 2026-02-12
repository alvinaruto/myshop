import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        // Get all products with their categories
        const products = await models.Product.findAll({
            where: { is_active: true },
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' }
            ]
        });

        const accessories: any[] = [];
        const devices: any[] = [];

        for (const product of products) {
            const p = (product as any).toJSON();

            if (p.is_serialized) {
                // Serialized products (devices) - count in-stock serial items
                const inStockCount = await models.SerialItem.count({
                    where: {
                        product_id: p.id,
                        status: 'in_stock'
                    }
                });

                if (inStockCount <= p.low_stock_threshold) {
                    devices.push({
                        ...p,
                        available_stock: inStockCount
                    });
                }
            } else {
                // Non-serialized products (accessories) - check quantity
                if (p.quantity <= p.low_stock_threshold) {
                    accessories.push(p);
                }
            }
        }

        // Sort by stock level ascending (lowest stock first)
        accessories.sort((a, b) => a.quantity - b.quantity);
        devices.sort((a, b) => a.available_stock - b.available_stock);

        return NextResponse.json({
            success: true,
            data: {
                accessories,
                devices,
                total: accessories.length + devices.length
            }
        });
    } catch (error: any) {
        console.error('Low stock error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
