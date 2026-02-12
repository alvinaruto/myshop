const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { Category, Brand, Warranty, SerialItem, Product } = require('../models');

// These routes do NOT require authentication

/**
 * Public warranty lookup by Serial Number / IMEI
 */
router.get('/warranty/check/:serial_number', async (req, res, next) => {
    try {
        const { serial_number } = req.params;
        const warranty = await Warranty.findOne({
            include: [
                {
                    model: SerialItem,
                    as: 'serialItem',
                    where: { serial_number },
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!warranty) {
            return res.status(404).json({
                success: false,
                message: 'No warranty record found for this Serial/IMEI'
            });
        }

        res.json({
            success: true,
            data: {
                product: warranty.serialItem.product.name,
                serial_number: warranty.serialItem.serial_number,
                start_date: warranty.start_date,
                end_date: warranty.end_date,
                status: warranty.status,
                isValid: warranty.isValid()
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all products (public)
 */
router.get('/products', productController.getProducts);

/**
 * Get single product (public)
 */
router.get('/products/:id', productController.getProduct);

/**
 * Get all categories (public)
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all brands (public)
 */
router.get('/brands', async (req, res, next) => {
    try {
        const brands = await Brand.findAll({
            order: [['name', 'ASC']]
        });
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
