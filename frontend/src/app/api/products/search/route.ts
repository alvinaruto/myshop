import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';

        if (!q || q.length < 1) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        // Search products by name, SKU, barcode, or model
        const products = await models.Product.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { sku: { [Op.iLike]: `%${q}%` } },
                    { barcode: { [Op.iLike]: `%${q}%` } },
                    { model: { [Op.iLike]: `%${q}%` } }
                ]
            },
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' }
            ],
            limit: 20,
            order: [['name', 'ASC']]
        });

        // For serialized products, get available stock count
        const results = await Promise.all(products.map(async (product: any) => {
            const p = (product as any).toJSON();
            if (p.is_serialized) {
                const inStockCount = await models.SerialItem.count({
                    where: {
                        product_id: p.id,
                        status: 'in_stock'
                    }
                });
                p.available_stock = inStockCount;
            } else {
                p.available_stock = p.quantity;
            }
            return p;
        }));

        return NextResponse.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Product search error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
