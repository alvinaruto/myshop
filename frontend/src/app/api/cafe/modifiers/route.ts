import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';

// GET /api/cafe/modifiers - List all modifiers
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const where: any = { is_available: true };
        if (category) where.category = category;

        const modifiers = await models.MenuModifier.findAll({
            where,
            order: [['category', 'ASC'], ['sort_order', 'ASC'], ['name', 'ASC']]
        });

        // Group by category
        const grouped: Record<string, any[]> = {};
        modifiers.forEach((mod: any) => {
            if (!grouped[mod.category]) grouped[mod.category] = [];
            grouped[mod.category].push(mod);
        });

        return NextResponse.json({
            success: true,
            data: { modifiers, grouped }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/modifiers - Create a modifier
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { name, name_kh, category, price } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: 'Modifier name is required' },
                { status: 400 }
            );
        }

        const modifier = await models.MenuModifier.create({
            name,
            name_kh,
            category: category || 'extras',
            price: price || 0
        });

        return NextResponse.json({
            success: true,
            data: { modifier }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/modifiers - Delete a modifier (by query param)
export async function DELETE(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Modifier ID is required' },
                { status: 400 }
            );
        }

        const modifier = await models.MenuModifier.findByPk(id);
        if (!modifier) {
            return NextResponse.json(
                { success: false, message: 'Modifier not found' },
                { status: 404 }
            );
        }

        await modifier.destroy();

        return NextResponse.json({
            success: true,
            message: 'Modifier deleted'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
