const { User } = require('../models');

const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { username, password, full_name, role } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const user = await User.create({
            username,
            password_hash: password,
            full_name,
            role: role || 'cashier'
        });

        res.status(201).json({ success: true, message: 'User created', data: user.toJSON() });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { full_name, role, is_active, password } = req.body;

        if (password) {
            user.password_hash = password;
        }
        if (full_name) user.full_name = full_name;
        if (role) user.role = role;
        if (is_active !== undefined) user.is_active = is_active;

        await user.save();
        res.json({ success: true, message: 'User updated', data: user.toJSON() });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ is_active: false });
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
