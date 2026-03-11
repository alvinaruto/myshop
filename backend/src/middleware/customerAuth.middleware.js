const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';

/**
 * Middleware to authenticate customer JWT tokens.
 * Attaches req.customer on success.
 */
const authenticateCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.customerId) {
            return res.status(401).json({ success: false, message: 'Invalid token type' });
        }

        const customer = await Customer.findByPk(decoded.customerId);
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Customer not found' });
        }

        req.customer = customer;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { authenticateCustomer };
