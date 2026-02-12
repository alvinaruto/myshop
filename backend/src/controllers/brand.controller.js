const { Brand } = require('../models');

const getBrands = async (req, res, next) => {
    try {
        const brands = await Brand.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
};

const createBrand = async (req, res, next) => {
    try {
        const { name, logo_url } = req.body;
        const brand = await Brand.create({ name, logo_url });
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        next(error);
    }
};

const updateBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        await brand.update(req.body);
        res.json({ success: true, data: brand });
    } catch (error) {
        next(error);
    }
};

const deleteBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        await brand.update({ is_active: false });
        res.json({ success: true, message: 'Brand deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
