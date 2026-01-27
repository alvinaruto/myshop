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
        const limit = parseInt(searchParams.get('limit') || '10');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get top selling products by counting sale items
        const topProducts = await models.SaleItem.findAll({
            attributes: [
                'product_id',
                [fn('SUM', col('SaleItem.quantity')), 'total_sold'],
                [fn('SUM', col('SaleItem.total')), 'total_revenue']
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
                        { model: models.Category, as: 'category', attributes: ['id', 'name'] },
                        { model: models.Brand, as: 'brand', attributes: ['id', 'name'] }
                    ]
                }
            ],
            group: ['SaleItem.product_id', 'product.id', 'product.name', 'product.sku', 'product.selling_price',
                'product->category.id', 'product->category.name',
                'product->brand.id', 'product->brand.name'],
            order: [[literal('total_sold'), 'DESC']],
            limit,
            raw: false
        });

        // Format the response to match frontend expectations
        const formattedData = topProducts.map((item: any) => ({
            product: item.product,
            total_sold: parseInt(item.getDataValue('total_sold') || '0'),
            total_revenue: item.getDataValue('total_revenue') || '0'
        }));

        return NextResponse.json({
            success: true,
            data: formattedData
        });
    } catch (error: any) {
        console.error('Top selling error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
