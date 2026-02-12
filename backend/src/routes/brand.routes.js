const router = require('express').Router();
const controller = require('../controllers/brand.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', controller.getBrands);
router.post('/', authorize('admin', 'manager'), controller.createBrand);
router.patch('/:id', authorize('admin', 'manager'), controller.updateBrand);
router.delete('/:id', authorize('admin'), controller.deleteBrand);

module.exports = router;
