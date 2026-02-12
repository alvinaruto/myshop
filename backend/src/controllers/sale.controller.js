const { Op } = require('sequelize');
const { sequelize, Sale, SaleItem, Product, SerialItem, Warranty, Customer, User, ExchangeRate } = require('../models');
const { calculatePayment } = require('../utils/currency.util');
const { checkTransactionStatus } = require('../services/bakong.service');

/**
 * Get today's exchange rate or default
 */
const getTodayRate = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const rate = await ExchangeRate.findOne({
        where: { rate_date: today },
        order: [['created_at', 'DESC']]
    });
    return rate ? parseFloat(rate.usd_to_khr) : parseFloat(process.env.DEFAULT_EXCHANGE_RATE) || 4100;
};

/**
 * Create new sale
 */
const createSale = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            items, // Array of { product_id, quantity, serial_item_id?, unit_price, discount }
            customer_id,
            payment_method,
            paid_usd,
            paid_khr,
            discount_usd,
            khqr_reference,
            notes,
            warranty_months = 12
        } = req.body;

        // Get exchange rate
        const exchangeRate = await getTodayRate();

        // Calculate totals
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction });

            if (!product) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            const unitPrice = item.unit_price || product.selling_price;
            const quantity = item.quantity || 1;
            const itemDiscount = item.discount || 0;
            const itemTotal = (unitPrice * quantity) - itemDiscount;

            // For serialized items
            if (product.is_serialized) {
                if (!item.serial_item_id) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Serial item required for ${product.name}`
                    });
                }

                const serialItem = await SerialItem.findByPk(item.serial_item_id, { transaction });

                if (!serialItem || serialItem.status !== 'in_stock') {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Serial item ${item.serial_item_id} is not available`
                    });
                }

                processedItems.push({
                    product,
                    serialItem,
                    quantity: 1,
                    unitPrice,
                    costPrice: serialItem.cost_price || product.cost_price,
                    discount: itemDiscount,
                    total: itemTotal
                });
            } else {
                // Non-serialized items
                if (product.quantity < quantity) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
                    });
                }

                processedItems.push({
                    product,
                    serialItem: null,
                    quantity,
                    unitPrice,
                    costPrice: product.cost_price,
                    discount: itemDiscount,
                    total: itemTotal
                });
            }

            subtotal += itemTotal;
        }

        const totalDiscount = parseFloat(discount_usd) || 0;
        const totalUsd = subtotal - totalDiscount;

        // Calculate payment
        const payment = calculatePayment({
            totalUsd,
            paidUsd: paid_usd,
            paidKhr: paid_khr,
            exchangeRate
        });

        if (!payment.isPaid) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Payment insufficient. Remaining: $${payment.remainingUsd} or ៛${payment.remainingKhr}`
            });
        }

        // Create sale
        const sale = await Sale.create({
            cashier_id: req.user.id,
            customer_id,
            subtotal_usd: subtotal,
            discount_usd: totalDiscount,
            total_usd: totalUsd,
            paid_usd: payment.paidUsd,
            paid_khr: payment.paidKhr,
            change_usd: payment.changeUsd,
            change_khr: payment.changeKhr,
            exchange_rate: exchangeRate,
            payment_method,
            khqr_reference,
            notes,
            status: 'completed'
        }, { transaction });

        // Create sale items and update stock
        for (const item of processedItems) {
            await SaleItem.create({
                sale_id: sale.id,
                product_id: item.product.id,
                serial_item_id: item.serialItem?.id,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                cost_price: item.costPrice,
                discount: item.discount,
                total: item.total
            }, { transaction });

            // Update stock
            if (item.serialItem) {
                await item.serialItem.update({
                    status: 'sold',
                    sale_id: sale.id,
                    sold_at: new Date()
                }, { transaction });

                // Create warranty for serialized items
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + warranty_months);

                await Warranty.create({
                    serial_item_id: item.serialItem.id,
                    sale_id: sale.id,
                    start_date: startDate,
                    end_date: endDate,
                    duration_months: warranty_months,
                    status: 'active'
                }, { transaction });
            } else {
                await item.product.decrement('quantity', {
                    by: item.quantity,
                    transaction
                });
            }
        }

        await transaction.commit();

        // Fetch complete sale data
        const completeSale = await Sale.findByPk(sale.id, {
            include: [
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: SerialItem, as: 'serialItem' }
                    ]
                },
                { model: User, as: 'cashier', attributes: ['id', 'full_name'] },
                { model: Customer, as: 'customer' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Sale completed successfully',
            data: {
                sale: completeSale,
                payment: {
                    ...payment,
                    changeMessage: payment.changeKhr > 0
                        ? `Change: ៛${payment.changeKhr.toLocaleString()}`
                        : payment.changeUsd > 0
                            ? `Change: $${payment.changeUsd}`
                            : 'Exact amount'
                }
            }
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Get all sales with filters
 */
const getSales = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            start_date,
            end_date,
            cashier_id,
            payment_method,
            status = 'completed'
        } = req.query;

        const where = { status };

        if (start_date && end_date) {
            where.created_at = {
                [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')]
            };
        } else if (start_date) {
            where.created_at = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            where.created_at = { [Op.lte]: new Date(end_date + 'T23:59:59') };
        }

        if (cashier_id) where.cashier_id = cashier_id;
        if (payment_method) where.payment_method = payment_method;

        // Restrict cashiers to only their own sales
        if (req.user.role === 'cashier') {
            where.cashier_id = req.user.id;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: sales } = await Sale.findAndCountAll({
            where,
            include: [
                { model: User, as: 'cashier', attributes: ['id', 'full_name'] },
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                sales,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single sale by ID
 */
const getSale = async (req, res, next) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        {
                            model: SerialItem,
                            as: 'serialItem',
                            include: [{ model: Warranty, as: 'warranty' }]
                        }
                    ]
                },
                { model: User, as: 'cashier', attributes: ['id', 'full_name'] },
                { model: Customer, as: 'customer' }
            ]
        });

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        // Hide cost info for cashiers
        if (req.user.role === 'cashier') {
            const saleJson = sale.toJSON();
            saleJson.items = saleJson.items.map(item => {
                delete item.cost_price;
                if (item.product) delete item.product.cost_price;
                return item;
            });
            return res.json({ success: true, data: saleJson });
        }

        res.json({
            success: true,
            data: sale
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Void a sale (admin only)
 */
const voidSale = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: SerialItem, as: 'serialItem' }
                    ]
                }
            ],
            transaction
        });

        if (!sale) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        if (sale.status === 'voided') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Sale is already voided'
            });
        }

        // Restore stock
        for (const item of sale.items) {
            if (item.serialItem) {
                await item.serialItem.update({
                    status: 'in_stock',
                    sale_id: null,
                    sold_at: null
                }, { transaction });

                // Void warranty
                await Warranty.update(
                    { status: 'voided' },
                    { where: { serial_item_id: item.serialItem.id, sale_id: sale.id }, transaction }
                );
            } else {
                await item.product.increment('quantity', {
                    by: item.quantity,
                    transaction
                });
            }
        }

        await sale.update({
            status: 'voided',
            notes: `${sale.notes || ''}\n[VOIDED by ${req.user.full_name} on ${new Date().toISOString()}]`
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Sale voided successfully'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Verify KHQR Payment
 */
const verifyKhqrPayment = async (req, res, next) => {
    try {
        const { md5 } = req.body;

        if (!md5) {
            return res.status(400).json({
                success: false,
                message: 'MD5 hash is required'
            });
        }

        // Call Bakong service to check status
        const result = await checkTransactionStatus(md5);

        if (result.success) {
            // You might want to validate the amount and currency here if returned by API
            // For now, we return the success status to the frontend
            return res.json({
                success: true,
                message: 'Payment verified successfully',
                data: result.data
            });
        } else {
            return res.json({
                success: false,
                message: result.message || 'Payment not found or failed',
                code: result.code
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSale,
    getSales,
    getSale,
    voidSale,
    getTodayRate,
    verifyKhqrPayment
};
