// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
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
            }
        },
        set_by: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    }, {
        tableName: 'exchange_rates',
        underscored: true,
        indexes: [
            { fields: ['rate_date'] }
        ]
    });

    (ExchangeRate as any).associate = (models: any) => {
        ExchangeRate.belongsTo(models.User, { foreignKey: 'set_by', as: 'user' });
    };

    return ExchangeRate;
};
