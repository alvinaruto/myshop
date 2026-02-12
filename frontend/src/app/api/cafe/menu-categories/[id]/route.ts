import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

// GET /api/cafe/menu-categories/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const category = await models.MenuCategory.findByPk(params.id, {
            include: [{
                model: models.MenuItem,
                as: 'items',
                where: { is_active: true },
                required: false
            }]
        });

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error: any) {
        console.error('Error fetching menu category:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/menu-categories/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const category = await models.MenuCategory.findByPk(params.id);

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        await (category as any).update(body);

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error: any) {
        console.error('Error updating menu category:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/menu-categories/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const category = await models.MenuCategory.findByPk(params.id);

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        // Soft delete - set is_active to false
        await (category as any).update({ is_active: false });

        return NextResponse.json({
            success: true,
            message: 'Category deleted'
        });
    } catch (error: any) {
        console.error('Error deleting menu category:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
