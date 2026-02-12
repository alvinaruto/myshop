import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/customers - List or search customers
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const phone = searchParams.get('phone');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = { is_active: true };

        if (phone) {
            where.phone = phone;
        } else if (search) {
            where[Op.or] = [
                { phone: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { rows: customers, count } = await models.CafeCustomer.findAndCountAll({
            where,
            order: [['loyalty_points', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return NextResponse.json({
            success: true,
            data: {
                customers,
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/customers - Create or find customer
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { phone, name, email } = body;

        if (!phone) {
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Find or create customer
        const [customer, created] = await models.CafeCustomer.findOrCreate({
            where: { phone },
            defaults: { phone, name, email }
        });

        // Update name/email if provided and customer exists
        if (!created && (name || email)) {
            await customer.update({
                ...(name && { name }),
                ...(email && { email })
            });
        }

        return NextResponse.json({
            success: true,
            data: { customer, created },
            message: created ? 'Customer created' : 'Customer found'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/customers - Add points to customer
export async function PATCH(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { customer_id, points_to_add, order_amount } = body;

        if (!customer_id) {
            return NextResponse.json(
                { success: false, message: 'Customer ID is required' },
                { status: 400 }
            );
        }

        const customer: any = await models.CafeCustomer.findByPk(customer_id);
        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Calculate points: 1 point per $1 spent
        const newPoints = points_to_add || Math.floor(order_amount || 0);
        const currentPoints = customer.loyalty_points || 0;
        const totalPoints = currentPoints + newPoints;

        // Determine tier based on total points
        let tier = 'bronze';
        if (totalPoints >= 500) tier = 'platinum';
        else if (totalPoints >= 200) tier = 'gold';
        else if (totalPoints >= 50) tier = 'silver';

        await customer.update({
            loyalty_points: totalPoints,
            total_spent: parseFloat(customer.total_spent || 0) + parseFloat(order_amount || 0),
            total_orders: (customer.total_orders || 0) + 1,
            last_visit: new Date(),
            tier
        });

        return NextResponse.json({
            success: true,
            data: {
                customer: await customer.reload(),
                points_added: newPoints,
                new_total: totalPoints,
                tier
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
