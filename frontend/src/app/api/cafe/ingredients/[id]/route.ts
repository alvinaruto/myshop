import { NextRequest, NextResponse } from 'next/server';
import { models, getSequelize } from '@/lib/db';

// GET /api/cafe/ingredients/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ingredient = await models.Ingredient.findByPk(params.id, {
            include: [{
                model: models.StockTransaction,
                as: 'transactions',
                limit: 20,
                order: [['created_at', 'DESC']]
            }]
        });

        if (!ingredient) {
            return NextResponse.json(
                { success: false, message: 'Ingredient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...(ingredient as any).toJSON(),
                stock_status: (ingredient as any).getStockStatus()
            }
        });
    } catch (error: any) {
        console.error('Error fetching ingredient:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/ingredients/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const ingredient = await models.Ingredient.findByPk(params.id);

        if (!ingredient) {
            return NextResponse.json(
                { success: false, message: 'Ingredient not found' },
                { status: 404 }
            );
        }

        await (ingredient as any).update(body);

        return NextResponse.json({
            success: true,
            data: {
                ...(ingredient as any).toJSON(),
                stock_status: (ingredient as any).getStockStatus()
            }
        });
    } catch (error: any) {
        console.error('Error updating ingredient:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/ingredients/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ingredient = await models.Ingredient.findByPk(params.id);

        if (!ingredient) {
            return NextResponse.json(
                { success: false, message: 'Ingredient not found' },
                { status: 404 }
            );
        }

        // Soft delete
        await (ingredient as any).update({ is_active: false });

        return NextResponse.json({
            success: true,
            message: 'Ingredient deleted'
        });
    } catch (error: any) {
        console.error('Error deleting ingredient:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
