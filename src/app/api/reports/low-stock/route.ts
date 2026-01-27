import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        // Find non-serialized products where quantity <= low_stock_threshold
        const lowStockProducts = await models.Product.findAll({
            where: {
                is_active: true,
                is_serialized: false,
                quantity: {
                    [Op.lte]: sequelize.col('low_stock_threshold')
                }
            },
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' }
            ],
            order: [['quantity', 'ASC']]
        });

        // For serialized products, count items in stock
        const serializedProducts = await models.Product.findAll({
            where: {
                is_active: true,
                is_serialized: true
            },
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' }
            ]
        });

        const lowStockSerializedProducts = [];
        for (const product of serializedProducts) {
            const inStockCount = await models.SerialItem.count({
                where: {
                    product_id: (product as any).id,
                    status: 'in_stock'
                }
            });

            if (inStockCount <= (product as any).low_stock_threshold) {
                lowStockSerializedProducts.push({
                    ...(product as any).toJSON(),
                    in_stock_count: inStockCount
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                regular: lowStockProducts,
                serialized: lowStockSerializedProducts,
                total: lowStockProducts.length + lowStockSerializedProducts.length
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
