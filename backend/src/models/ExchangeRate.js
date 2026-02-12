const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ExchangeRate = sequelize.define('ExchangeRate', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        rate_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            unique: true
        },
        usd_to_khr: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 1
            },
            comment: 'How many KHR equals 1 USD'
        },
        set_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'exchange_rates',
        indexes: [
            { fields: ['rate_date'] }
        ]
    });

    return ExchangeRate;
};
