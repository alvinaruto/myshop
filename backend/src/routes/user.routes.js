const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', controller.getUsers);

router.post('/', [
    body('username').isLength({ min: 3 }),
    body('password').isLength({ min: 6 }),
    body('full_name').notEmpty(),
    body('role').isIn(['admin', 'manager', 'cashier'])
], validate, controller.createUser);

router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
