const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/sale.controller');
const { authenticate, authorize, permissions } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', controller.getSales);
router.get('/:id', controller.getSale);

router.post('/', [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('payment_method').isIn(['cash', 'card', 'khqr', 'split']),
    body('paid_usd').optional().isNumeric(),
    body('paid_khr').optional().isNumeric()
], validate, controller.createSale);

router.post('/verify-khqr', [
    body('md5').notEmpty().withMessage('MD5 hash is required')
], validate, controller.verifyKhqrPayment);

router.post('/:id/void', authorize('admin'), controller.voidSale);

module.exports = router;
