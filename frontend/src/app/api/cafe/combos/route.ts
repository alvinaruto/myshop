import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/combos - List active combos
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('all') === 'true';

        const now = new Date();
        const where: any = {};

        if (!includeInactive) {
            where.is_active = true;
            where[Op.or] = [
                { valid_from: null, valid_until: null },
                { valid_from: { [Op.lte]: now }, valid_until: { [Op.gte]: now } },
                { valid_from: { [Op.lte]: now }, valid_until: null },
                { valid_from: null, valid_until: { [Op.gte]: now } }
            ];
        }

        const combos = await models.MenuCombo.findAll({
            where,
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        return NextResponse.json({
            success: true,
            data: { combos }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/combos - Create a combo
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { name, name_kh, description, price, original_price, items, image_url, valid_from, valid_until } = body;

        if (!name || !price || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Name, price, and items are required' },
                { status: 400 }
            );
        }

        const combo = await models.MenuCombo.create({
            name,
            name_kh,
            description,
            price,
            original_price,
            items,
            image_url,
            valid_from: valid_from || null,
            valid_until: valid_until || null
        });

        return NextResponse.json({
            success: true,
            data: { combo }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/combos - Update a combo
export async function PATCH(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Combo ID is required' },
                { status: 400 }
            );
        }

        const combo = await models.MenuCombo.findByPk(id);
        if (!combo) {
            return NextResponse.json(
                { success: false, message: 'Combo not found' },
                { status: 404 }
            );
        }

        await combo.update(updates);

        return NextResponse.json({
            success: true,
            data: { combo }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/combos - Delete a combo
export async function DELETE(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Combo ID is required' },
                { status: 400 }
            );
        }

        const combo = await models.MenuCombo.findByPk(id);
        if (!combo) {
            return NextResponse.json(
                { success: false, message: 'Combo not found' },
                { status: 404 }
            );
        }

        await combo.destroy();

        return NextResponse.json({
            success: true,
            message: 'Combo deleted'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
