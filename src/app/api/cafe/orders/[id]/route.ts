import { NextRequest, NextResponse } from 'next/server';
import { models, getSequelize } from '@/lib/db';

// GET /api/cafe/orders/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const order = await models.CafeOrder.findByPk(params.id, {
            include: [
                {
                    model: models.CafeOrderItem,
                    as: 'items',
                    include: [{
                        model: models.MenuItem,
                        as: 'menuItem'
                    }]
                },
                {
                    model: models.User,
                    as: 'cashier',
                    attributes: ['id', 'username', 'full_name']
                }
            ]
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/orders/[id] - Update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const order = await models.CafeOrder.findByPk(params.id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Only allow status updates
        if (body.status) {
            await order.update({ status: body.status });
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/orders/[id]/void - Void order (restore stock)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
        const order = await models.CafeOrder.findByPk(params.id, {
            include: [{ model: models.CafeOrderItem, as: 'items' }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        if ((order as any).status === 'voided') {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Order already voided' },
                { status: 400 }
            );
        }

        // Restore stock for each item
        for (const item of (order as any).items) {
            const recipes = await models.Recipe.findAll({
                where: {
                    menu_item_id: item.menu_item_id,
                    size: item.size
                },
                transaction
            });

            for (const recipe of recipes) {
                const ingredient = await models.Ingredient.findByPk(
                    (recipe as any).ingredient_id,
                    { transaction }
                );
                if (ingredient) {
                    const restoreQty = parseFloat((recipe as any).quantity) * item.quantity;
                    const currentQty = parseFloat((ingredient as any).quantity);
                    await ingredient.update({ quantity: currentQty + restoreQty }, { transaction });

                    // Log the restoration
                    await models.StockTransaction.create({
                        ingredient_id: (recipe as any).ingredient_id,
                        type: 'in',
                        quantity: restoreQty,
                        reference_type: 'sale',
                        reference_id: params.id,
                        notes: `Stock restored from voided order ${(order as any).order_number}`
                    }, { transaction });
                }
            }
        }

        await order.update({ status: 'voided' }, { transaction });
        await transaction.commit();

        return NextResponse.json({
            success: true,
            message: 'Order voided and stock restored'
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error voiding order:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
