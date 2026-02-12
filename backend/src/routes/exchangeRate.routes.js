const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/exchangeRate.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', controller.getTodayRate);
router.get('/history', authorize('admin', 'manager'), controller.getRateHistory);

router.post('/', authorize('admin', 'manager'), [
    body('usd_to_khr').isNumeric().isFloat({ min: 1 }).withMessage('Rate must be positive number')
], validate, controller.setTodayRate);

module.exports = router;
