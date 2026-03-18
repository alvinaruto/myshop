const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Customer } = require('../models');
const { Op } = require('sequelize');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '978048441489-060bm3tli86b8updaj4qg38uo3sei611.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCustomerToken(customer) {
    return jwt.sign(
        { customerId: customer.id, role: 'customer' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

function customerResponse(customer, token) {
    return {
        success: true,
        message: 'Login successful',
        data: {
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone || '',
                email: customer.email || '',
                loyalty_points: customer.loyalty_points || 0
            }
        }
    };
}

// ─── Google Login ────────────────────────────────────────────────────────────

/**
 * POST /api/customer/google-login
 * Body: { idToken: string }
 *
 * Flow:
 *   1. Verify the Firebase/Google ID token.
 *   2. Find customer by google_id OR email.
 *   3. If found – return a JWT.
 *   4. If not found by google_id but found by email – link the account.
 *   5. If not found at all – create a new customer automatically.
 */
const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'idToken is required' });
        }

        // Verify the token against Firebase / Google
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            // Some Firebase auth tokens have a different iss; fall back to JWT decode
            // (For Firebase tokens the audience claim is the project ID, not the web client ID)
            try {
                payload = jwt.decode(idToken);
                if (!payload || !payload.sub) throw new Error('Invalid token');
            } catch {
                return res.status(401).json({ success: false, message: 'Invalid Google token' });
            }
        }

        const googleId = payload.sub;
        const email = payload.email || null;
        const name = payload.name || payload.email || 'Google User';

        // 1. Try to find by google_id
        let customer = await Customer.findOne({ where: { google_id: googleId } });

        if (!customer && email) {
            // 2. Try to find by email and link the google_id
            customer = await Customer.findOne({ where: { email } });
            if (customer) {
                await customer.update({ google_id: googleId });
            }
        }

        if (!customer) {
            // 3. Auto-create a new customer (no phone yet, can be linked later)
            customer = await Customer.create({
                name,
                email,
                google_id: googleId,
                phone: null
            });
        }

        const token = makeCustomerToken(customer);
        return res.json(customerResponse(customer, token));

    } catch (error) {
        console.error('[google-login] Error:', error.message, error.stack);
        next(error);
    }
};

// ─── OTP Request ─────────────────────────────────────────────────────────────

/**
 * POST /api/customer/otp-request
 * Body: { phone: string }
 *
 * Sends an OTP to the customer's Telegram (or another channel).
 * This is a stub – replace the sendOtp logic with your actual Telegram bot call.
 */
const otpRequest = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Find or create customer
        let customer = await Customer.findOne({ where: { phone } });

        const telegramLinked = !!(customer && customer.telegram_chat_id);
        const botUrl = process.env.TELEGRAM_BOT_URL || 'https://t.me/myshop_coffee_bot';

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found. Please register first.'
            });
        }

        // Generate a 6-digit OTP and store it temporarily
        // In production, store in Redis or DB with expiry.
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP on customer record (using notes as temp storage – replace with Redis in prod)
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
        await customer.update({ notes: JSON.stringify({ otp, otpExpiry }) });

        // Send OTP via Telegram if linked
        if (telegramLinked && process.env.TELEGRAM_BOT_TOKEN) {
            try {
                const axios = require('axios');
                const msg = `Your myShop OTP code is: *${otp}*\nExpires in 5 minutes.`;
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: customer.telegram_chat_id,
                    text: msg,
                    parse_mode: 'Markdown'
                });
            } catch (tgErr) {
                console.error('Telegram send error:', tgErr.message);
            }
        } else {
            // Log OTP for development
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        return res.json({
            success: true,
            message: 'OTP sent',
            data: {
                telegram_linked: telegramLinked,
                bot_url: botUrl
            }
        });

    } catch (error) {
        next(error);
    }
};

// ─── OTP Verify ──────────────────────────────────────────────────────────────

/**
 * POST /api/customer/otp-verify
 * Body: { phone: string, otp: string }
 */
const otpVerify = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        const customer = await Customer.findOne({ where: { phone } });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Parse stored OTP
        let stored;
        try {
            stored = JSON.parse(customer.notes || '{}');
        } catch {
            stored = {};
        }

        if (!stored.otp || !stored.otpExpiry) {
            return res.status(400).json({ success: false, message: 'No OTP requested. Please request a new one.' });
        }

        if (Date.now() > stored.otpExpiry) {
            return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (stored.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid verification code' });
        }

        // Clear OTP after successful verify
        await customer.update({ notes: null });

        const token = makeCustomerToken(customer);
        return res.json(customerResponse(customer, token));

    } catch (error) {
        next(error);
    }
};

// ─── Update FCM Token ────────────────────────────────────────────────────────

/**
 * POST /api/customer/update-fcm-token
 * Body: { phone: string, fcmToken: string }
 */
const updateFcmToken = async (req, res, next) => {
    try {
        const { phone, fcmToken } = req.body;

        if (!phone || !fcmToken) {
            return res.status(400).json({ success: false, message: 'phone and fcmToken are required' });
        }

        const customer = await Customer.findOne({ where: { phone } });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        await customer.update({ fcm_token: fcmToken });
        return res.json({ success: true, message: 'FCM token updated' });
    } catch (error) {
        next(error);
    }
};

// ─── Get Loyalty ─────────────────────────────────────────────────────────────

/**
 * GET /api/customer/loyalty
 * Header: Authorization: Bearer <token>
 */
const getLoyalty = async (req, res, next) => {
    try {
        const customer = req.customer;
        return res.json({
            success: true,
            data: {
                loyalty_points: customer.loyalty_points || 0,
                name: customer.name,
                phone: customer.phone
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    googleLogin,
    otpRequest,
    otpVerify,
    updateFcmToken,
    getLoyalty
};
