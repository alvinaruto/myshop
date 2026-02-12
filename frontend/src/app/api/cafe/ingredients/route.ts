import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/ingredients - List all ingredients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const low_stock = searchParams.get('low_stock') === 'true';

        const where: any = { is_active: true };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { name_kh: { [Op.iLike]: `%${search}%` } }
            ];
        }

        let ingredients = await models.Ingredient.findAll({
            where,
            order: [['name', 'ASC']]
        });

        // Filter low stock if requested
        if (low_stock) {
            ingredients = ingredients.filter((ing: any) => {
                const qty = parseFloat(ing.quantity);
                const threshold = parseFloat(ing.low_stock_threshold);
                return qty <= threshold;
            });
        }

        // Add stock status to each ingredient
        const data = ingredients.map((ing: any) => ({
            ...(ing as any).toJSON(),
            stock_status: ing.getStockStatus()
        }));

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('Error fetching ingredients:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/ingredients - Create ingredient
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, name_kh, unit, cost_per_unit, quantity, low_stock_threshold } = body;

        if (!name || !unit) {
            return NextResponse.json(
                { success: false, message: 'Name and unit are required' },
                { status: 400 }
            );
        }

        const ingredient = await models.Ingredient.create({
            name,
            name_kh,
            unit,
            cost_per_unit: cost_per_unit || 0,
            quantity: quantity || 0,
            low_stock_threshold: low_stock_threshold || 10
        });

        return NextResponse.json({
            success: true,
            data: {
                ...(ingredient as any).toJSON(),
                stock_status: (ingredient as any).getStockStatus()
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating ingredient:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
