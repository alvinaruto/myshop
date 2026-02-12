const { Op, fn, col, literal } = require('sequelize');
const { sequelize, Sale, SaleItem, Product, User, Brand, Category } = require('../models');

const getDailySales = async (req, res, next) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().slice(0, 10);

        const sales = await Sale.findAll({
            where: {
                status: 'completed',
                created_at: {
                    [Op.gte]: new Date(targetDate),
                    [Op.lt]: new Date(new Date(targetDate).getTime() + 86400000)
                }
            },
            include: [{ model: User, as: 'cashier', attributes: ['id', 'full_name'] }]
        });

        const summary = {
            date: targetDate,
            totalSales: sales.length,
            totalUsd: sales.reduce((sum, s) => sum + parseFloat(s.total_usd), 0),
            totalPaidUsd: sales.reduce((sum, s) => sum + parseFloat(s.paid_usd), 0),
            totalPaidKhr: sales.reduce((sum, s) => sum + parseFloat(s.paid_khr), 0),
            byPaymentMethod: {
                cash: sales.filter(s => s.payment_method === 'cash').length,
                card: sales.filter(s => s.payment_method === 'card').length,
                khqr: sales.filter(s => s.payment_method === 'khqr').length,
                split: sales.filter(s => s.payment_method === 'split').length
            }
        };

        res.json({ success: true, data: { summary, sales } });
    } catch (error) {
        next(error);
    }
};

const getProfitReport = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'start_date and end_date required' });
        }

        const saleItems = await SaleItem.findAll({
            include: [{
                model: Sale,
                as: 'sale',
                where: {
                    status: 'completed',
                    created_at: { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] }
                }
            }]
        });

        const totalRevenue = saleItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const totalCost = saleItems.reduce((sum, item) => sum + (parseFloat(item.cost_price || 0) * item.quantity), 0);
        const grossProfit = totalRevenue - totalCost;

        res.json({
            success: true,
            data: {
                period: { start_date, end_date },
                totalRevenue: totalRevenue.toFixed(2),
                totalCost: totalCost.toFixed(2),
                grossProfit: grossProfit.toFixed(2),
                profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTopSelling = async (req, res, next) => {
    try {
        const { days = 30, limit = 10 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const topProducts = await SaleItem.findAll({
            attributes: ['product_id', [fn('SUM', col('SaleItem.quantity')), 'total_sold'], [fn('SUM', col('SaleItem.total')), 'total_revenue']],
            include: [
                { model: Sale, as: 'sale', where: { status: 'completed', created_at: { [Op.gte]: startDate } }, attributes: [] },
                { model: Product, as: 'product', attributes: ['name', 'sku'], include: [{ model: Brand, as: 'brand', attributes: ['name'] }] }
            ],
            group: ['product_id', 'product.id', 'product.brand.id'],
            order: [[literal('total_sold'), 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ success: true, data: topProducts });
    } catch (error) {
        next(error);
    }
};

const getStaffPerformance = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;
        const where = { status: 'completed' };

        if (start_date && end_date) {
            where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')] };
        }

        const performance = await Sale.findAll({
            attributes: ['cashier_id', [fn('COUNT', col('Sale.id')), 'total_sales'], [fn('SUM', col('total_usd')), 'total_revenue']],
            where,
            include: [{ model: User, as: 'cashier', attributes: ['id', 'full_name'] }],
            group: ['cashier_id', 'cashier.id'],
            order: [[literal('total_revenue'), 'DESC']]
        });

        res.json({ success: true, data: performance });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDailySales, getProfitReport, getTopSelling, getStaffPerformance };
