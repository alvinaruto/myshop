import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

interface Params {
    params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const category = await models.Category.findByPk(params.id);
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: category });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return forbiddenResponse();
        }

        const category = await models.Category.findByPk(params.id);
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        const data = await req.json();
        await (category as any).update(data);

        return NextResponse.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error: any) {
        console.error('Category update error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin') {
            return forbiddenResponse();
        }

        const category = await models.Category.findByPk(params.id);
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        // Check if category has products
        const productCount = await models.Product.count({ where: { category_id: params.id } });
        if (productCount > 0) {
            return NextResponse.json({
                success: false,
                message: `Cannot delete category with ${productCount} products`
            }, { status: 400 });
        }

        await (category as any).destroy();

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error: any) {
        console.error('Category delete error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
