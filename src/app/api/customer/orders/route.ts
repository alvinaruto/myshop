import { NextRequest, NextResponse } from 'next/server';
import { models, getSequelize } from '@/lib/db';
import { sendOrderNotification, isTelegramConfigured } from '@/lib/telegram';

// POST /api/customer/orders - Create customer order (no auth required)
export async function POST(request: NextRequest) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
        const body = await request.json();
        const {
            customer_phone,
            customer_name,
            items,
            order_type = 'takeaway',
            table_number,
            notes
        } = body;

        // Validate required fields
        if (!items || items.length === 0) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Order items are required' },
                { status: 400 }
            );
        }

        if (!customer_phone) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Get current exchange rate
        const exchangeRateSetting = await models.ExchangeRate.findOne({
            order: [['rate_date', 'DESC']],
            transaction
        });
        const exchange_rate = exchangeRateSetting
            ? parseFloat((exchangeRateSetting as any).usd_to_khr)
            : 4100;


        // Find or create customer
        let customer = await models.CafeCustomer.findOne({
            where: { phone: customer_phone },
            transaction
        });

        if (!customer) {
            customer = await models.CafeCustomer.create({
                phone: customer_phone,
                name: customer_name || null,
            }, { transaction });
        } else if (customer_name && !(customer as any).name) {
            await customer.update({ name: customer_name }, { transaction });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await models.MenuItem.findByPk(item.menu_item_id, { transaction });
            if (!menuItem) {
                await transaction.rollback();
                return NextResponse.json(
                    { success: false, message: `Menu item not found` },
                    { status: 404 }
                );
            }

            // Check availability
            if (!(menuItem as any).is_available) {
                await transaction.rollback();
                return NextResponse.json(
                    { success: false, message: `${(menuItem as any).name} is currently unavailable` },
                    { status: 400 }
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

            const itemTotal = unitPrice * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                menu_item_id: item.menu_item_id,
                name: (menuItem as any).name,
                size: item.size || 'regular',
                quantity: item.quantity,
                unit_price: unitPrice,
                discount: 0,
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

        // Create order - try with notes first, fallback to without if column doesn't exist
        const baseOrderData: any = {
            customer_id: (customer as any).id,
            order_type,
            table_number: order_type === 'dine_in' ? table_number : null,
            subtotal_usd: subtotal,
            total_usd: totalUsd,
            paid_usd: 0,
            paid_khr: 0,
            change_usd: 0,
            change_khr: 0,
            exchange_rate,
            payment_method: 'cash',
            status: 'pending'
        };

        let order;
        try {
            // Try creating with notes field
            order = await models.CafeOrder.create({ ...baseOrderData, notes: notes || null }, { transaction });
        } catch (createError: any) {
            // If notes column doesn't exist, create without it
            if (createError.message && createError.message.includes('notes')) {
                order = await models.CafeOrder.create(baseOrderData, { transaction });
            } else {
                throw createError;
            }
        }

        // Create order items
        for (const item of orderItems) {
            await models.CafeOrderItem.create({
                order_id: (order as any).id,
                ...item
            }, { transaction });
        }

        // Update customer stats
        await customer.update({
            total_orders: ((customer as any).total_orders || 0) + 1,
            total_spent: parseFloat((customer as any).total_spent || 0) + totalUsd,
            last_visit: new Date()
        }, { transaction });

        await transaction.commit();

        // Fetch complete order
        const createdOrder = await models.CafeOrder.findByPk((order as any).id, {
            include: [
                { model: models.CafeOrderItem, as: 'items' },
                { model: models.CafeCustomer, as: 'customer', attributes: ['id', 'name', 'phone'] }
            ]
        });

        // Send Telegram notification (don't await, fire and forget)
        if (isTelegramConfigured()) {
            sendOrderNotification({
                order_number: (createdOrder as any).order_number,
                customer_name: customer_name || undefined,
                customer_phone,
                order_type,
                table_number,
                items: orderItems,
                total_usd: totalUsd,
                notes: notes || undefined,
                created_at: (createdOrder as any).createdAt
            }).catch(err => console.error('Telegram notification failed:', err));
        }

        return NextResponse.json({
            success: true,
            data: {
                order: createdOrder,
                message: 'Order placed successfully! Please proceed to the counter for payment.'
            }
        }, { status: 201 });

    } catch (error: any) {
        await transaction.rollback();
        console.error('Error creating customer order:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// GET /api/customer/orders - Get orders by phone number
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Find customer
        const customer = await models.CafeCustomer.findOne({
            where: { phone }
        });

        if (!customer) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        // Get customer's recent orders
        const orders = await models.CafeOrder.findAll({
            where: { customer_id: (customer as any).id },
            include: [
                { model: models.CafeOrderItem, as: 'items' }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        return NextResponse.json({
            success: true,
            data: orders
        });

    } catch (error: any) {
        console.error('Error fetching customer orders:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
