const router = require('express').Router();
const controller = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/daily', controller.getDailySales);
router.get('/profit', controller.getProfitReport);
router.get('/top-selling', controller.getTopSelling);
router.get('/staff-performance', controller.getStaffPerformance);

module.exports = router;
