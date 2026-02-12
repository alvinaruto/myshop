const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authenticate user via JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const secret = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
            const decoded = jwt.verify(token, secret);

            const user = await User.findByPk(decoded.userId);

            if (!user || !user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or user inactive.'
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user has required role
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Check specific permissions
 */
const permissions = {
    canViewCostPrice: (req, res, next) => {
        if (['admin', 'manager'].includes(req.user.role)) {
            req.canViewCostPrice = true;
        } else {
            req.canViewCostPrice = false;
        }
        next();
    },

    canDeleteSales: (req, res, next) => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete sales.'
            });
        }
    },

    canEditStock: (req, res, next) => {
        if (['admin', 'manager'].includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Only admin or manager can edit stock.'
            });
        }
    }
};

module.exports = {
    authenticate,
    authorize,
    permissions
};
