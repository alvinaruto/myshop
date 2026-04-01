const { Op } = require('sequelize');
const { Product, Category, Brand, SerialItem, sequelize } = require('../models');

/**
 * Get all products with filters
 */
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            category_id,
            brand_id,
            condition,
            is_serialized,
            low_stock,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const where = { is_active: true };

        // Search filter
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } },
                { barcode: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (category_id) where.category_id = category_id;
        if (brand_id) where.brand_id = brand_id;
        if (condition) where.condition = condition;
        if (is_serialized !== undefined) where.is_serialized = is_serialized === 'true';

        // Low stock filter (for non-serialized items)
        if (low_stock === 'true') {
            where.is_serialized = false;
            where.quantity = {
                [Op.lte]: { [Op.col]: 'low_stock_threshold' }
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'name_kh'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] }
            ],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        // Hide cost price for cashiers
        const sanitizedProducts = products.map(p => {
            const product = p.toJSON();
            if (!req.canViewCostPrice) {
                delete product.cost_price;
            }
            return product;
        });

        res.json({
            success: true,
            data: {
                products: sanitizedProducts,
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
 * Get single product by ID
 */
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                {
                    model: SerialItem,
                    as: 'serialItems',
                    where: { status: 'in_stock' },
                    required: false
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const result = product.toJSON();
        if (!req.canViewCostPrice) {
            delete result.cost_price;
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new product
 */
const createProduct = async (req, res, next) => {
    try {
        const {
            category_id,
            brand_id,
            name,
            name_kh,
            model,
            sku,
            barcode,
            cost_price,
            selling_price,
            is_serialized,
            quantity,
            low_stock_threshold,
            storage_capacity,
            color,
            condition,
            description,
            image_url
        } = req.body;

        // Check for duplicate SKU
        const existingSku = await Product.findOne({ where: { sku } });
        if (existingSku) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }

        // Check for duplicate barcode if provided
        if (barcode) {
            const existingBarcode = await Product.findOne({ where: { barcode } });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Barcode already exists'
                });
            }
        }

        const product = await Product.create({
            category_id,
            brand_id,
            name,
            name_kh,
            model,
            sku,
            barcode,
            cost_price: cost_price || 0,
            selling_price: selling_price || 0,
            is_serialized: is_serialized || false,
            quantity: is_serialized ? 0 : (quantity || 0),
            low_stock_threshold: low_stock_threshold || 5,
            storage_capacity,
            color,
            condition: condition || 'new',
            description,
            image_url
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update product
 */
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check for duplicate SKU if changing
        if (req.body.sku && req.body.sku !== product.sku) {
            const existingSku = await Product.findOne({ where: { sku: req.body.sku } });
            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
        }

        await product.update(req.body);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete product (soft delete)
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.update({ is_active: false });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search products by barcode or name (for POS)
 */
const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        const products = await Product.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { barcode: { [Op.iLike]: `%${q}%` } },
                    { sku: { [Op.iLike]: `%${q}%` } }
                ]
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name'] }
            ],
            limit: 10
        });

        // Batch stock count for serialized products (avoids N+1)
        const serializedIds = products.filter(p => p.is_serialized).map(p => p.id);
        const stockCounts = serializedIds.length > 0
            ? await SerialItem.findAll({
                attributes: [
                    'product_id',
                    [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'stock_count']
                ],
                where: { product_id: { [Op.in]: serializedIds }, status: 'in_stock' },
                group: ['product_id'],
                raw: true
            })
            : [];

        const stockMap = {};
        for (const row of stockCounts) {
            stockMap[row.product_id] = parseInt(row.stock_count) || 0;
        }

        const results = products.map(p => {
            const product = p.toJSON();
            if (product.is_serialized) {
                product.available_stock = stockMap[product.id] || 0;
            } else {
                product.available_stock = product.quantity;
            }
            delete product.cost_price;
            return product;
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get low stock products
 */
const getLowStockProducts = async (req, res, next) => {
    try {
        // Non-serialized products below threshold
        const lowStockProducts = await Product.findAll({
            where: {
                is_active: true,
                is_serialized: false,
                quantity: {
                    [Op.lte]: sequelize.col('low_stock_threshold')
                }
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name'] }
            ],
            order: [['quantity', 'ASC']]
        });

        // Serialized products with low stock — batch count instead of N+1
        const serialStockCounts = await SerialItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'stock_count']
            ],
            where: { status: 'in_stock' },
            group: ['product_id'],
            raw: true
        });

        const stockMap = {};
        for (const row of serialStockCounts) {
            stockMap[row.product_id] = parseInt(row.stock_count) || 0;
        }

        const serializedProducts = await Product.findAll({
            where: {
                is_active: true,
                is_serialized: true
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name'] }
            ]
        });

        const lowStockSerialized = serializedProducts
            .filter(product => {
                const count = stockMap[product.id] || 0;
                return count <= product.low_stock_threshold;
            })
            .map(product => {
                const p = product.toJSON();
                p.available_stock = stockMap[product.id] || 0;
                return p;
            });

        res.json({
            success: true,
            data: {
                accessories: lowStockProducts,
                devices: lowStockSerialized
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getLowStockProducts
};
