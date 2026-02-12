const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Login user
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Contact administrator.'
            });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
    res.json({
        success: true,
        data: req.user.toJSON()
    });
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate current password
        const isValid = await req.user.validatePassword(currentPassword);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        req.user.password_hash = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout (client-side token removal, optional server-side blacklist)
 */
const logout = async (req, res) => {
    // In a production app, you might want to:
    // - Add the token to a blacklist in Redis
    // - Clear any refresh tokens from the database

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    login,
    getProfile,
    changePassword,
    logout
};
