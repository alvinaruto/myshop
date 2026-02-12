const { Op } = require('sequelize');
const { ExchangeRate, User } = require('../models');

const getTodayRate = async (req, res, next) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        let rate = await ExchangeRate.findOne({
            where: { rate_date: today },
            include: [{ model: User, as: 'setByUser', attributes: ['id', 'full_name'] }]
        });

        if (!rate) {
            return res.json({
                success: true,
                data: {
                    rate_date: today,
                    usd_to_khr: parseFloat(process.env.DEFAULT_EXCHANGE_RATE) || 4100,
                    is_default: true
                }
            });
        }

        res.json({ success: true, data: { ...rate.toJSON(), is_default: false } });
    } catch (error) {
        next(error);
    }
};

const setTodayRate = async (req, res, next) => {
    try {
        const { usd_to_khr } = req.body;
        const today = new Date().toISOString().slice(0, 10);

        let rate = await ExchangeRate.findOne({ where: { rate_date: today } });

        if (rate) {
            await rate.update({ usd_to_khr, set_by: req.user.id });
        } else {
            rate = await ExchangeRate.create({ rate_date: today, usd_to_khr, set_by: req.user.id });
        }

        res.json({ success: true, message: 'Exchange rate updated', data: rate });
    } catch (error) {
        next(error);
    }
};

const getRateHistory = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const rates = await ExchangeRate.findAll({
            where: { rate_date: { [Op.gte]: startDate.toISOString().slice(0, 10) } },
            order: [['rate_date', 'DESC']]
        });

        res.json({ success: true, data: rates });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTodayRate, setTodayRate, getRateHistory };
