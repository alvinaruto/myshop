import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const product = await models.Product.findByPk(params.id, {
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' },
                {
                    model: models.SerialItem,
                    as: 'serialItems',
                    where: { status: 'in_stock' },
                    required: false
                }
            ]
        });

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const canViewCostPrice = auth.role === 'admin' || auth.role === 'manager';
        const result = (product as any).toJSON();

        if (!canViewCostPrice) {
            delete result.cost_price;
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });
        }

        const product = await models.Product.findByPk(params.id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const data = await req.json();

        // Check for duplicate SKU if changing
        if (data.sku && data.sku !== (product as any).sku) {
            const existingSku = await models.Product.findOne({ where: { sku: data.sku } });
            if (existingSku) {
                return NextResponse.json({ success: false, message: 'SKU already exists' }, { status: 400 });
            }
        }

        await (product as any).update(data);

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Only admins can delete products' }, { status: 403 });
        }

        const product = await models.Product.findByPk(params.id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        // Soft delete
        await (product as any).update({ is_active: false });

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
