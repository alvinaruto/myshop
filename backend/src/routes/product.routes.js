const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/product.controller');
const { authenticate, authorize, permissions } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', permissions.canViewCostPrice, controller.getProducts);
router.get('/search', controller.searchProducts);
router.get('/low-stock', authorize('admin', 'manager'), controller.getLowStockProducts);
router.get('/:id', permissions.canViewCostPrice, controller.getProduct);

router.post('/', authorize('admin', 'manager'), [
    body('category_id').isUUID(),
    body('name').notEmpty(),
    body('sku').notEmpty(),
    body('selling_price').isNumeric()
], validate, controller.createProduct);

router.patch('/:id', authorize('admin', 'manager'), controller.updateProduct);
router.delete('/:id', authorize('admin'), controller.deleteProduct);

module.exports = router;
