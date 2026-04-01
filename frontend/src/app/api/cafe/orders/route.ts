import { NextRequest, NextResponse } from 'next/server';
import { models, getSequelize } from '@/lib/db';
import { Op } from 'sequelize';
import { sendCustomerAlert, sendOrderStatusToGroup, isTelegramConfigured } from '@/lib/telegram';
import { sendFcmNotification } from '@/lib/fcm';

// GET /api/cafe/orders - List orders
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};

        if (status) {
            // Support comma-separated status values
            const statuses = status.split(',').map(s => s.trim());
            if (statuses.length > 1) {
                where.status = { [Op.in]: statuses };
            } else {
                where.status = status;
            }
        }

        if (date) {
            const sequelize = getSequelize();
            where[Op.and] = sequelize.where(
                sequelize.fn('DATE', sequelize.col('created_at')),
                date
            );
        }

        const orders = await models.CafeOrder.findAll({
            where,
            include: [
                {
                    model: models.CafeOrderItem,
                    as: 'items',
                    include: [{
                        model: models.MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'name', 'name_kh', 'image_url']
                    }]
                },
                {
                    model: models.User,
                    as: 'cashier',
                    attributes: ['id', 'username', 'full_name']
                }
            ],
            order: [['created_at', 'DESC']],
            limit
        });

        return NextResponse.json({
            success: true,
            data: orders
        });
    } catch (error: any) {
        console.error('Error fetching cafe orders:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/orders - Create order (with stock deduction)
export async function POST(request: NextRequest) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
        const body = await request.json();
        const {
            cashier_id, items, exchange_rate,
            paid_usd, paid_khr, payment_method, notes
        } = body;

        if (!items || items.length === 0 || !exchange_rate) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Items and exchange rate are required' },
                { status: 400 }
            );
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await models.MenuItem.findByPk(item.menu_item_id, { transaction });
            if (!menuItem) {
                await transaction.rollback();
                return NextResponse.json(
                    { success: false, message: `Menu item ${item.menu_item_id} not found` },
                    { status: 404 }
                );
            }

            // Get price based on size
            let unitPrice = parseFloat((menuItem as any).base_price);
            if (item.size === 'medium' && (menuItem as any).price_medium) {
                unitPrice = parseFloat((menuItem as any).price_medium);
            } else if (item.size === 'medium') {
                unitPrice += 0.50;
            } else if (item.size === 'large' && (menuItem as any).price_large) {
                unitPrice = parseFloat((menuItem as any).price_large);
            } else if (item.size === 'large') {
                unitPrice += 1.00;
            }

            const itemTotal = unitPrice * item.quantity - (item.discount || 0);
            subtotal += itemTotal;

            orderItems.push({
                menu_item_id: item.menu_item_id,
                name: (menuItem as any).name,
                size: item.size || 'regular',
                quantity: item.quantity,
                unit_price: unitPrice,
                discount: item.discount || 0,
                total: itemTotal,
                customizations: item.customizations || {}
            });

            // Deduct ingredients based on recipe
            const recipes = await models.Recipe.findAll({
                where: {
                    menu_item_id: item.menu_item_id,
                    size: item.size || 'regular'
                },
                transaction
            });

            for (const recipe of recipes) {
                const ingredient = await models.Ingredient.findByPk(
                    (recipe as any).ingredient_id,
                    { transaction }
                );
                if (ingredient) {
                    const recipeQty = parseFloat((recipe as any).quantity) * item.quantity;
                    const currentQty = parseFloat((ingredient as any).quantity);
                    const newQty = currentQty - recipeQty;

                    if (newQty < 0) {
                        await transaction.rollback();
                        return NextResponse.json(
                            { success: false, message: `Insufficient stock for ${(ingredient as any).name}` },
                            { status: 400 }
                        );
                    }

                    await ingredient.update({ quantity: newQty }, { transaction });
                }
            }
        }

        const totalUsd = subtotal;
        const paidUsdAmount = parseFloat(paid_usd || 0);
        const paidKhrAmount = parseFloat(paid_khr || 0);
        const paidKhrInUsd = paidKhrAmount / exchange_rate;
        const totalPaid = paidUsdAmount + paidKhrInUsd;
        const changeTotal = totalPaid - totalUsd;

        // Calculate change
        let changeUsd = 0;
        let changeKhr = 0;
        if (changeTotal > 0) {
            if (changeTotal >= 20) {
                changeUsd = Math.floor(changeTotal);
                const remainder = changeTotal - changeUsd;
                changeKhr = Math.round(remainder * exchange_rate / 100) * 100;
            } else {
                changeKhr = Math.round(changeTotal * exchange_rate / 100) * 100;
            }
        }

        // Create order
        const order = await (models.CafeOrder as any).create({
            cashier_id: cashier_id || null,
            subtotal_usd: subtotal,
            total_usd: totalUsd,
            paid_usd: paidUsdAmount,
            paid_khr: paidKhrAmount,
            change_usd: changeUsd,
            change_khr: changeKhr,
            exchange_rate,
            payment_method: payment_method || 'cash',
            status: 'pending',  // Start as pending for kitchen queue
            notes
        }, { transaction });

        // Create order items
        for (const item of orderItems) {
            await (models.CafeOrderItem as any).create({
                order_id: (order as any).id,
                ...item
            }, { transaction });
        }

        await transaction.commit();

        // Fetch complete order
        const createdOrder = await models.CafeOrder.findByPk((order as any).id, {
            include: [
                { model: models.CafeOrderItem, as: 'items' },
                { model: models.User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        return NextResponse.json({
            success: true,
            data: {
                order: createdOrder,
                payment: {
                    totalPaid,
                    changeUsd,
                    changeKhr,
                    changeMessage: changeUsd > 0 || changeKhr > 0
                        ? `Change: ${changeUsd > 0 ? `$${changeUsd}` : ''} ${changeKhr > 0 ? `៛${changeKhr.toLocaleString()}` : ''}`.trim()
                        : 'Exact amount'
                }
            }
        }, { status: 201 });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error creating cafe order:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/orders?id={orderId} - Update order status
// Uses query param to avoid Vercel monorepo dynamic-segment routing issues
export async function PATCH(
    request: NextRequest
) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const order = await models.CafeOrder.findByPk(orderId, {
            include: [
                { model: models.CafeCustomer, as: 'customer' }
            ]
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const oldStatus = (order as any).status;
        const newStatus = body.status;

        if (newStatus && oldStatus !== newStatus) {
            await (order as any).update({ status: newStatus });

            const customer = (order as any).customer;
            const orderNumber = (order as any).order_number;

            if (isTelegramConfigured()) {
                if (['preparing', 'ready', 'completed', 'voided'].includes(newStatus)) {
                    sendOrderStatusToGroup(
                        orderNumber,
                        newStatus,
                        customer?.name || customer?.phone
                    ).catch((err: any) => console.error('Group status notification failed:', err));
                }

                if (
                    customer?.telegram_chat_id &&
                    ['preparing', 'ready', 'completed'].includes(newStatus)
                ) {
                    sendCustomerAlert(
                        customer.telegram_chat_id,
                        orderNumber,
                        newStatus
                    ).catch((err: any) => console.error('Customer alert failed:', err));
                }

                if (['preparing', 'ready', 'completed'].includes(newStatus)) {
                    const statusMessages: Record<string, { title: string, body: string }> = {
                        'preparing': {
                            title: 'Order Preparing ☕',
                            body: `Your order #${orderNumber} is now being prepared!`
                        },
                        'ready': {
                            title: 'Order Ready! ✨',
                            body: `Your order #${orderNumber} is ready for pickup!`
                        },
                        'completed': {
                            title: 'Order Completed ✅',
                            body: `Thanks for your visit! Hope to see you again soon.`
                        }
                    };

                    const msg = statusMessages[newStatus];
                    if (msg && customer?.phone) {
                        sendFcmNotification(
                            customer.phone,
                            msg.title,
                            msg.body,
                            { type: 'order_status', order_id: orderId, status: newStatus }
                        ).catch((err: any) => console.error('FCM notification failed:', err));
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
