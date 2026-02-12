import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category_id = searchParams.get('category_id');
        const brand_id = searchParams.get('brand_id');
        const condition = searchParams.get('condition');
        const is_serialized = searchParams.get('is_serialized');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const sort_by = searchParams.get('sort_by') || 'created_at';
        const sort_order = (searchParams.get('sort_order') || 'DESC').toUpperCase();

        const where: any = { is_active: true };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } },
                { barcode: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (category_id) where.category_id = category_id;
        if (brand_id) where.brand_id = brand_id;
        if (condition) where.condition = condition;
        if (is_serialized !== null) where.is_serialized = is_serialized === 'true';

        const offset = (page - 1) * limit;

        const { count, rows: products } = await models.Product.findAndCountAll({
            where,
            include: [
                { model: models.Category, as: 'category', attributes: ['id', 'name', 'name_kh'] },
                { model: models.Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] }
            ],
            order: [[sort_by, sort_order]],
            limit,
            offset,
            distinct: true
        });

        // For public API, we always hide cost price
        const sanitizedProducts = products.map((p: any) => {
            const product = (p as any).toJSON();
            delete product.cost_price;
            return product;
        });

        return NextResponse.json({
            success: true,
            data: {
                products: sanitizedProducts,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
