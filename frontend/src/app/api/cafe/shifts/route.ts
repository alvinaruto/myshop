import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { Op } from 'sequelize';

// GET /api/cafe/shifts - Get shifts
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const cashierId = searchParams.get('cashier_id');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        const where: any = {};
        if (cashierId) where.cashier_id = cashierId;
        if (status) where.status = status;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.start_time = { [Op.between]: [startOfDay, endOfDay] };
        }

        const shifts = await models.CafeShift.findAll({
            where,
            include: [{ model: models.User, as: 'cashier', attributes: ['id', 'full_name', 'email'] }],
            order: [['start_time', 'DESC']],
            limit: 50
        });

        return NextResponse.json({
            success: true,
            data: { shifts }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/shifts - Start a new shift
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { cashier_id, opening_cash_usd, opening_cash_khr } = body;

        if (!cashier_id) {
            return NextResponse.json(
                { success: false, message: 'Cashier ID is required' },
                { status: 400 }
            );
        }

        // Check if cashier already has an open shift
        const existingShift = await models.CafeShift.findOne({
            where: { cashier_id, status: 'open' }
        });

        if (existingShift) {
            return NextResponse.json(
                { success: false, message: 'You already have an open shift', shift: existingShift },
                { status: 400 }
            );
        }

        const shift = await models.CafeShift.create({
            cashier_id,
            opening_cash_usd: opening_cash_usd || 0,
            opening_cash_khr: opening_cash_khr || 0,
            start_time: new Date()
        });

        return NextResponse.json({
            success: true,
            data: { shift },
            message: 'Shift started'
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/shifts - End a shift
export async function PATCH(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { shift_id, closing_cash_usd, closing_cash_khr, notes } = body;

        if (!shift_id) {
            return NextResponse.json(
                { success: false, message: 'Shift ID is required' },
                { status: 400 }
            );
        }

        const shift: any = await models.CafeShift.findByPk(shift_id);
        if (!shift) {
            return NextResponse.json(
                { success: false, message: 'Shift not found' },
                { status: 404 }
            );
        }

        if (shift.status === 'closed') {
            return NextResponse.json(
                { success: false, message: 'Shift is already closed' },
                { status: 400 }
            );
        }

        // Calculate sales during shift
        const orders = await models.CafeOrder.findAll({
            where: {
                cashier_id: shift.cashier_id,
                status: 'completed',
                created_at: {
                    [Op.between]: [shift.start_time, new Date()]
                }
            }
        });

        const totalSalesUsd = orders.reduce((sum: number, order: any) =>
            sum + parseFloat(order.total_usd || 0), 0
        );
        const cashSalesUsd = orders
            .filter((o: any) => o.payment_method === 'cash')
            .reduce((sum: number, order: any) => sum + parseFloat(order.paid_usd || 0), 0);

        // Expected cash = opening + cash sales
        const expectedCashUsd = parseFloat(shift.opening_cash_usd || 0) + cashSalesUsd;
        const discrepancyUsd = (closing_cash_usd || 0) - expectedCashUsd;

        await shift.update({
            end_time: new Date(),
            closing_cash_usd,
            closing_cash_khr,
            expected_cash_usd: expectedCashUsd,
            discrepancy_usd: discrepancyUsd,
            total_sales_usd: totalSalesUsd,
            total_orders: orders.length,
            status: 'closed',
            notes
        });

        return NextResponse.json({
            success: true,
            data: {
                shift: await shift.reload(),
                summary: {
                    totalOrders: orders.length,
                    totalSalesUsd,
                    expectedCashUsd,
                    actualCashUsd: closing_cash_usd,
                    discrepancyUsd
                }
            },
            message: 'Shift closed successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
