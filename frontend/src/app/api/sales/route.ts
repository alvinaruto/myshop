import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { Op } from 'sequelize';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { calculatePayment } from '@/lib/currency';

async function getTodayRate() {
    const today = new Date().toISOString().slice(0, 10);
    const rate = await models.ExchangeRate.findOne({
        where: { rate_date: today },
        order: [['created_at', 'DESC']]
    });
    return rate ? parseFloat((rate as any).usd_to_khr) : 4100;
}

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const status = searchParams.get('status') || 'completed';
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');

        const where: any = { status };
        if (start_date && end_date) {
            where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] };
        }

        if (auth.role === 'cashier') {
            where.cashier_id = auth.userId;
        }

        const offset = (page - 1) * limit;
        const { count, rows: sales } = await models.Sale.findAndCountAll({
            where,
            include: [
                { model: models.User, as: 'cashier', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        return NextResponse.json({
            success: true,
            data: {
                sales,
                pagination: { total: count, page, limit }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const transaction = await sequelize.transaction();
    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            await transaction.rollback();
            return unauthorizedResponse();
        }

        const body = await req.json();
        const { items, customer_id, payment_method, paid_usd, paid_khr, discount_usd, notes, warranty_months = 12 } = body;

        const exchangeRate = await getTodayRate();
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await models.Product.findByPk(item.product_id, { transaction }) as any;
            if (!product) throw new Error(`Product ${item.product_id} not found`);

            const unitPrice = item.unit_price || product.selling_price;
            const quantity = item.quantity || 1;
            const itemDiscount = item.discount || 0;
            const itemTotal = (unitPrice * quantity) - itemDiscount;

            if (product.is_serialized) {
                const serialItem = await models.SerialItem.findByPk(item.serial_item_id, { transaction }) as any;
                if (!serialItem || serialItem.status !== 'in_stock') throw new Error(`Serial item not available`);
                processedItems.push({ product, serialItem, quantity: 1, unitPrice, costPrice: serialItem.cost_price || product.cost_price, discount: itemDiscount, total: itemTotal });
            } else {
                if (product.quantity < quantity) throw new Error(`Insufficient stock for ${product.name}`);
                processedItems.push({ product, serialItem: null, quantity, unitPrice, costPrice: product.cost_price, discount: itemDiscount, total: itemTotal });
            }
            subtotal += itemTotal;
        }

        const totalUsd = subtotal - (parseFloat(discount_usd) || 0);
        const payment = calculatePayment({ totalUsd, paidUsd: paid_usd, paidKhr: paid_khr, exchangeRate });

        if (!payment.isPaid) throw new Error('Insufficient payment');

        const sale = await models.Sale.create({
            cashier_id: auth.userId,
            customer_id,
            subtotal_usd: subtotal,
            discount_usd: parseFloat(discount_usd) || 0,
            total_usd: totalUsd,
            paid_usd: payment.paidUsd,
            paid_khr: payment.paidKhr,
            change_usd: payment.changeUsd,
            change_khr: payment.changeKhr,
            exchange_rate: exchangeRate,
            payment_method,
            notes,
            status: 'completed'
        }, { transaction }) as any;

        for (const item of processedItems) {
            await models.SaleItem.create({
                sale_id: sale.id,
                product_id: item.product.id,
                serial_item_id: item.serialItem?.id,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                cost_price: item.costPrice,
                discount: item.discount,
                total: item.total
            }, { transaction });

            if (item.serialItem) {
                await (item.serialItem as any).update({ status: 'sold', sale_id: sale.id, sold_at: new Date() }, { transaction });
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + warranty_months);
                await models.Warranty.create({ serial_item_id: item.serialItem.id, sale_id: sale.id, start_date: new Date(), end_date: endDate, duration_months: warranty_months, status: 'active' }, { transaction });
            } else {
                await item.product.decrement('quantity', { by: item.quantity, transaction });
            }
        }

        await transaction.commit();
        return NextResponse.json({ success: true, data: { sale } });
    } catch (error: any) {
        await transaction.rollback();
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
