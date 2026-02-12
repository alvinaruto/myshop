import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

// GET /api/cafe/menu-items/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const item = await models.MenuItem.findByPk(params.id, {
            include: [
                { model: models.MenuCategory, as: 'category' },
                {
                    model: models.Recipe,
                    as: 'recipes',
                    include: [{ model: models.Ingredient, as: 'ingredient' }]
                }
            ]
        });

        if (!item) {
            return NextResponse.json(
                { success: false, message: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: item
        });
    } catch (error: any) {
        console.error('Error fetching menu item:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/menu-items/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const item = await models.MenuItem.findByPk(params.id);

        if (!item) {
            return NextResponse.json(
                { success: false, message: 'Menu item not found' },
                { status: 404 }
            );
        }

        // Update menu item
        await item.update(body);

        // Update recipes if provided
        if (body.recipes && Array.isArray(body.recipes)) {
            // Delete existing recipes
            await models.Recipe.destroy({
                where: { menu_item_id: params.id }
            });

            // Create new recipes
            for (const recipe of body.recipes) {
                await models.Recipe.create({
                    menu_item_id: params.id,
                    ingredient_id: recipe.ingredient_id,
                    size: recipe.size || 'regular',
                    quantity: recipe.quantity
                });
            }
        }

        // Fetch updated item
        const updated = await models.MenuItem.findByPk(params.id, {
            include: [
                { model: models.MenuCategory, as: 'category' },
                {
                    model: models.Recipe,
                    as: 'recipes',
                    include: [{ model: models.Ingredient, as: 'ingredient' }]
                }
            ]
        });

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error: any) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/menu-items/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const item = await models.MenuItem.findByPk(params.id);

        if (!item) {
            return NextResponse.json(
                { success: false, message: 'Menu item not found' },
                { status: 404 }
            );
        }

        // Soft delete
        await item.update({ is_active: false });

        return NextResponse.json({
            success: true,
            message: 'Menu item deleted'
        });
    } catch (error: any) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
