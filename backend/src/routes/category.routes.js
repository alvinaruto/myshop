const router = require('express').Router();
const controller = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', controller.getCategories);
router.post('/', authorize('admin', 'manager'), controller.createCategory);
router.patch('/:id', authorize('admin', 'manager'), controller.updateCategory);
router.delete('/:id', authorize('admin'), controller.deleteCategory);

module.exports = router;
