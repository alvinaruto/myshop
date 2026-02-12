const { Category } = require('../models');

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, name_kh, is_serialized, description } = req.body;
        const category = await Category.create({ name, name_kh, is_serialized, description });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        await category.update(req.body);
        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        await category.destroy();
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
