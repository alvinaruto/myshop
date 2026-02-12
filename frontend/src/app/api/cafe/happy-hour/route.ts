import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/happy-hour - Get active happy hours or check current
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const checkActive = searchParams.get('current') === 'true';
        const categoryId = searchParams.get('category_id');
        const menuItemId = searchParams.get('menu_item_id');

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

        const where: any = { is_active: true };

        if (checkActive) {
            // Only get currently active happy hours
            where.start_time = { [Op.lte]: currentTime };
            where.end_time = { [Op.gt]: currentTime };
            where[Op.and] = [
                { days_of_week: { [Op.contains]: [currentDay] } }
            ];
            // Check validity dates
            where[Op.or] = [
                { valid_from: null, valid_until: null },
                { valid_from: { [Op.lte]: now }, valid_until: { [Op.gte]: now } },
                { valid_from: { [Op.lte]: now }, valid_until: null },
                { valid_from: null, valid_until: { [Op.gte]: now } }
            ];
        }

        const shift = await (models.CafeShift as any).create({
            where,
            include: [{ model: models.MenuCategory, as: 'category' }],
            order: [['start_time', 'ASC']]
        });

        const happyHours = await models.HappyHour.findAll({
            where,
            include: [{ model: models.MenuCategory, as: 'category' }],
            order: [['start_time', 'ASC']]
        });

        // If checking for specific item, filter results
        let applicable = happyHours;
        if (checkActive && (categoryId || menuItemId)) {
            applicable = happyHours.filter((hh: any) => {
                if (hh.applies_to_all) return true;
                if (categoryId && hh.category_id === categoryId) return true;
                if (menuItemId && hh.menu_item_ids?.includes(menuItemId)) return true;
                return false;
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                happyHours: checkActive ? applicable : happyHours,
                isHappyHour: checkActive ? applicable.length > 0 : undefined
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/happy-hour - Create a happy hour
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const {
            name, description, discount_type, discount_value,
            start_time, end_time, days_of_week,
            category_id, menu_item_ids, applies_to_all,
            valid_from, valid_until
        } = body;

        if (!name || !start_time || !end_time) {
            return NextResponse.json(
                { success: false, message: 'Name, start_time, and end_time are required' },
                { status: 400 }
            );
        }

        const happyHour = await (models.HappyHour as any).create({
            name,
            description,
            discount_type: discount_type || 'percentage',
            discount_value: discount_value || 20,
            start_time,
            end_time,
            days_of_week: days_of_week || [1, 2, 3, 4, 5],
            category_id,
            menu_item_ids: menu_item_ids || [],
            applies_to_all: applies_to_all || false,
            valid_from,
            valid_until
        });

        return NextResponse.json({
            success: true,
            data: { happyHour }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/happy-hour - Delete a happy hour
export async function DELETE(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Happy hour ID is required' },
                { status: 400 }
            );
        }

        const happyHour = await models.HappyHour.findByPk(id);
        if (!happyHour) {
            return NextResponse.json(
                { success: false, message: 'Happy hour not found' },
                { status: 404 }
            );
        }

        await happyHour.destroy();

        return NextResponse.json({
            success: true,
            message: 'Happy hour deleted'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
