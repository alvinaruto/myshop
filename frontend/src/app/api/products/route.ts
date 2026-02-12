import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category_id = searchParams.get('category_id');
        const brand_id = searchParams.get('brand_id');
        const condition = searchParams.get('condition');
        const is_serialized = searchParams.get('is_serialized');
        const low_stock = searchParams.get('low_stock');
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

        // Low stock filter (for non-serialized items)
        if (low_stock === 'true') {
            where.is_serialized = false;
            where.quantity = {
                [Op.lte]: sequelize.col('low_stock_threshold')
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows: products } = await models.Product.findAndCountAll({
            where,
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' }
            ],
            order: [[sort_by, sort_order]],
            limit,
            offset,
            distinct: true
        });

        const canViewCostPrice = auth.role === 'admin' || auth.role === 'manager';

        // Sanitize for role
        const sanitizedProducts = products.map((p: any) => {
            const product = (p as any).toJSON();
            if (!canViewCostPrice) {
                delete product.cost_price;
            }
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

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });
        }

        const data = await req.json();

        // Sanitize empty strings to null for UUID fields
        const sanitizedData = {
            ...data,
            category_id: data.category_id || null,
            brand_id: data.brand_id || null,
            quantity: data.is_serialized ? 0 : (data.quantity || 0)
        };

        // Validate required fields
        if (!sanitizedData.category_id) {
            return NextResponse.json({ success: false, message: 'Category is required' }, { status: 400 });
        }

        if (!sanitizedData.name || !sanitizedData.sku) {
            return NextResponse.json({ success: false, message: 'Product name and SKU are required' }, { status: 400 });
        }

        // Validation check for SKU
        const existingSku = await models.Product.findOne({ where: { sku: data.sku } });
        if (existingSku) {
            return NextResponse.json({ success: false, message: 'SKU already exists' }, { status: 400 });
        }

        const product = await models.Product.create(sanitizedData);

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            data: product
        }, { status: 201 });
    } catch (error: any) {
        console.error('Product creation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
