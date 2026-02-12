const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/serialItem.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', controller.getSerialItems);
router.get('/imei/:imei', controller.getByImei);
router.get('/warranty/:imei', controller.checkWarranty);

router.post('/', authorize('admin', 'manager'), [
    body('product_id').isUUID(),
    body('imei').optional().matches(/^[0-9]{15}$/).withMessage('IMEI must be 15 digits')
], validate, controller.createSerialItem);

router.post('/bulk', authorize('admin', 'manager'), [
    body('product_id').isUUID(),
    body('items').isArray({ min: 1 })
], validate, controller.bulkCreateSerialItems);

router.patch('/:id', authorize('admin', 'manager'), controller.updateSerialItem);

module.exports = router;
