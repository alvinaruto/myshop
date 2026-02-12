const router = require('express').Router();
const { body } = require('express-validator');
const { login, getProfile, changePassword, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], validate, login);

router.get('/profile', authenticate, getProfile);

router.post('/change-password', authenticate, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, changePassword);

router.post('/logout', authenticate, logout);

module.exports = router;
