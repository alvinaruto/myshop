const { Op } = require('sequelize');
const { SerialItem, Product, Sale, Warranty } = require('../models');

/**
 * Get all serial items with filters
 */
const getSerialItems = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            product_id,
            status,
            search
        } = req.query;

        const where = {};

        if (product_id) where.product_id = product_id;
        if (status) where.status = status;

        if (search) {
            where[Op.or] = [
                { imei: { [Op.iLike]: `%${search}%` } },
                { serial_number: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: serialItems } = await SerialItem.findAndCountAll({
            where,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku', 'selling_price', 'color', 'storage_capacity']
                },
                {
                    model: Warranty,
                    as: 'warranty',
                    attributes: ['id', 'start_date', 'end_date', 'status']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                serialItems,
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
 * Get serial item by IMEI
 */
const getByImei = async (req, res, next) => {
    try {
        const { imei } = req.params;

        const serialItem = await SerialItem.findOne({
            where: { imei },
            include: [
                {
                    model: Product,
                    as: 'product',
                    include: [
                        { model: require('../models').Category, as: 'category' },
                        { model: require('../models').Brand, as: 'brand' }
                    ]
                },
                {
                    model: Warranty,
                    as: 'warranty'
                },
                {
                    model: Sale,
                    as: 'sale',
                    attributes: ['id', 'invoice_number', 'created_at']
                }
            ]
        });

        if (!serialItem) {
            return res.status(404).json({
                success: false,
                message: 'IMEI not found'
            });
        }

        res.json({
            success: true,
            data: serialItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add new serial item (IMEI/Serial)
 */
const createSerialItem = async (req, res, next) => {
    try {
        const { product_id, imei, serial_number, cost_price, notes } = req.body;

        // Verify product exists and is serialized
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.is_serialized) {
            return res.status(400).json({
                success: false,
                message: 'This product does not require serial tracking'
            });
        }

        // Check for duplicate IMEI
        if (imei) {
            const existingImei = await SerialItem.findOne({ where: { imei } });
            if (existingImei) {
                return res.status(400).json({
                    success: false,
                    message: 'This IMEI already exists in the system'
                });
            }
        }

        // Check for duplicate serial number
        if (serial_number) {
            const existingSerial = await SerialItem.findOne({ where: { serial_number } });
            if (existingSerial) {
                return res.status(400).json({
                    success: false,
                    message: 'This serial number already exists in the system'
                });
            }
        }

        const serialItem = await SerialItem.create({
            product_id,
            imei,
            serial_number,
            cost_price: cost_price || product.cost_price,
            notes,
            status: 'in_stock'
        });

        res.status(201).json({
            success: true,
            message: 'Serial item added successfully',
            data: serialItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk add serial items
 */
const bulkCreateSerialItems = async (req, res, next) => {
    try {
        const { product_id, items } = req.body;

        // Verify product exists and is serialized
        const product = await Product.findByPk(product_id);
        if (!product || !product.is_serialized) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product or product does not require serial tracking'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const item of items) {
            try {
                // Check duplicates
                if (item.imei) {
                    const existing = await SerialItem.findOne({ where: { imei: item.imei } });
                    if (existing) {
                        results.failed.push({ ...item, error: 'IMEI already exists' });
                        continue;
                    }
                }

                const serialItem = await SerialItem.create({
                    product_id,
                    imei: item.imei,
                    serial_number: item.serial_number,
                    cost_price: item.cost_price || product.cost_price,
                    notes: item.notes,
                    status: 'in_stock'
                });

                results.success.push(serialItem);
            } catch (err) {
                results.failed.push({ ...item, error: err.message });
            }
        }

        res.status(201).json({
            success: true,
            message: `Added ${results.success.length} items, ${results.failed.length} failed`,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update serial item status
 */
const updateSerialItem = async (req, res, next) => {
    try {
        const serialItem = await SerialItem.findByPk(req.params.id);

        if (!serialItem) {
            return res.status(404).json({
                success: false,
                message: 'Serial item not found'
            });
        }

        // Don't allow changing sold items
        if (serialItem.status === 'sold' && req.body.status !== 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify sold items'
            });
        }

        await serialItem.update(req.body);

        res.json({
            success: true,
            message: 'Serial item updated successfully',
            data: serialItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check warranty by IMEI
 */
const checkWarranty = async (req, res, next) => {
    try {
        const { imei } = req.params;

        const serialItem = await SerialItem.findOne({
            where: { imei },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'model', 'brand_id']
                },
                {
                    model: Warranty,
                    as: 'warranty'
                },
                {
                    model: Sale,
                    as: 'sale',
                    attributes: ['id', 'invoice_number', 'created_at']
                }
            ]
        });

        if (!serialItem) {
            return res.status(404).json({
                success: false,
                message: 'IMEI not found in system'
            });
        }

        if (!serialItem.warranty) {
            return res.json({
                success: true,
                data: {
                    imei,
                    product: serialItem.product,
                    hasWarranty: false,
                    message: 'No warranty record found'
                }
            });
        }

        const warranty = serialItem.warranty;
        const today = new Date();
        const endDate = new Date(warranty.end_date);
        const isValid = warranty.status === 'active' && endDate >= today;
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                imei,
                product: serialItem.product,
                hasWarranty: true,
                warranty: {
                    ...warranty.toJSON(),
                    isValid,
                    daysRemaining: isValid ? daysRemaining : 0
                },
                purchaseInfo: {
                    invoiceNumber: serialItem.sale?.invoice_number,
                    purchaseDate: serialItem.sale?.created_at
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSerialItems,
    getByImei,
    createSerialItem,
    bulkCreateSerialItems,
    updateSerialItem,
    checkWarranty
};
