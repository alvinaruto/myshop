import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op, fn, col, literal } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get top selling products by counting sale items
        const topProducts = await models.SaleItem.findAll({
            attributes: [
                'product_id',
                [fn('SUM', col('quantity')), 'total_quantity'],
                [fn('SUM', col('total')), 'total_revenue']
            ],
            include: [
                {
                    model: models.Sale,
                    as: 'sale',
                    where: {
                        created_at: { [Op.gte]: startDate },
                        status: 'completed'
                    },
                    attributes: []
                },
                {
                    model: models.Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku', 'selling_price'],
                    include: [
                        { model: models.Category, as: 'category', attributes: ['name'] },
                        { model: models.Brand, as: 'brand', attributes: ['name'] }
                    ]
                }
            ],
            group: ['product_id', 'product.id', 'product.name', 'product.sku', 'product.selling_price',
                'product->category.id', 'product->category.name',
                'product->brand.id', 'product->brand.name'],
            order: [[literal('total_quantity'), 'DESC']],
            limit: 10
        });

        return NextResponse.json({
            success: true,
            data: topProducts
        });
    } catch (error: any) {
        console.error('Top selling error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
