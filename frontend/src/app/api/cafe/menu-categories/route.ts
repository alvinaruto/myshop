import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

// GET /api/cafe/menu-categories - List all categories
export async function GET() {
    try {
        const categories = await models.MenuCategory.findAll({
            where: { is_active: true },
            order: [['display_order', 'ASC'], ['name', 'ASC']],
            include: [{
                model: models.MenuItem,
                as: 'items',
                where: { is_active: true },
                required: false
            }]
        });

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error('Error fetching menu categories:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/menu-categories - Create category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, name_kh, icon, display_order } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: 'Category name is required' },
                { status: 400 }
            );
        }

        const category = await models.MenuCategory.create({
            name,
            name_kh,
            icon: icon || '☕',
            display_order: display_order || 0
        });

        return NextResponse.json({
            success: true,
            data: category
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating menu category:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
