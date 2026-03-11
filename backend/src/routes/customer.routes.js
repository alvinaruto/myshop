const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticateCustomer } = require('../middleware/customerAuth.middleware');
const {
    googleLogin,
    otpRequest,
    otpVerify,
    updateFcmToken,
    getLoyalty
} = require('../controllers/customer.controller');

// ─── Auth endpoints ───────────────────────────────────────────────────────────

// Google Sign-In (mobile app)
router.post('/google-login',
    [body('idToken').notEmpty().withMessage('idToken is required')],
    validate,
    googleLogin
);

// Phone OTP – request
router.post('/otp-request',
    [body('phone').notEmpty().withMessage('Phone number is required')],
    validate,
    otpRequest
);

// Phone OTP – verify
router.post('/otp-verify',
    [
        body('phone').notEmpty().withMessage('Phone is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    ],
    validate,
    otpVerify
);

// ─── Authenticated endpoints ──────────────────────────────────────────────────

// Update FCM push-notification token
router.post('/update-fcm-token',
    [
        body('phone').notEmpty(),
        body('fcmToken').notEmpty()
    ],
    validate,
    updateFcmToken
);

// Loyalty points (requires customer JWT)
router.get('/loyalty', authenticateCustomer, getLoyalty);

module.exports = router;
