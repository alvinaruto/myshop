import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/menu-items - List all menu items
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category_id = searchParams.get('category_id');
        const search = searchParams.get('search');
        const available_only = searchParams.get('available_only') === 'true';

        const where: any = { is_active: true };

        if (category_id) {
            where.category_id = category_id;
        }

        if (available_only) {
            where.is_available = true;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { name_kh: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const items = await models.MenuItem.findAll({
            where,
            include: [
                {
                    model: models.MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'name_kh', 'icon']
                },
                {
                    model: models.Recipe,
                    as: 'recipes',
                    include: [{
                        model: models.Ingredient,
                        as: 'ingredient',
                        attributes: ['id', 'name', 'unit', 'quantity']
                    }]
                }
            ],
            order: [['name', 'ASC']]
        });

        return NextResponse.json({
            success: true,
            data: items
        });
    } catch (error: any) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/menu-items - Create menu item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            category_id, name, name_kh, description, image_url,
            base_price, has_sizes, price_medium, price_large,
            has_sugar_option, has_ice_option, recipes
        } = body;

        if (!category_id || !name || !base_price) {
            return NextResponse.json(
                { success: false, message: 'Category, name, and base price are required' },
                { status: 400 }
            );
        }

        // Verify category exists
        const category = await models.MenuCategory.findByPk(category_id);
        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        const item = await models.MenuItem.create({
            category_id,
            name,
            name_kh,
            description,
            image_url,
            base_price,
            has_sizes: has_sizes !== false,
            price_medium,
            price_large,
            has_sugar_option: has_sugar_option !== false,
            has_ice_option: has_ice_option !== false
        });

        // Create recipes if provided
        if (recipes && Array.isArray(recipes)) {
            for (const recipe of recipes) {
                await models.Recipe.create({
                    menu_item_id: (item as any).id,
                    ingredient_id: recipe.ingredient_id,
                    size: recipe.size || 'regular',
                    quantity: recipe.quantity
                });
            }
        }

        // Fetch with relations
        const created = await models.MenuItem.findByPk((item as any).id, {
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
            data: created
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
