// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const CafeShift = sequelize.define('CafeShift', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        cashier_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        opening_cash_usd: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        opening_cash_khr: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: 0
        },
        closing_cash_usd: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        },
        closing_cash_khr: {
            type: DataTypes.DECIMAL(15, 0),
            allowNull: true
        },
        expected_cash_usd: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        },
        expected_cash_khr: {
            type: DataTypes.DECIMAL(15, 0),
            allowNull: true
        },
        discrepancy_usd: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        },
        total_sales_usd: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        total_orders: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('open', 'closed'),
            defaultValue: 'open'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'cafe_shifts',
        underscored: true,
        indexes: [
            { fields: ['cashier_id'] },
            { fields: ['status'] },
            { fields: ['start_time'] }
        ]
    });

    (CafeShift as any).associate = (models: any) => {
        CafeShift.belongsTo(models.User, { foreignKey: 'cashier_id', as: 'cashier' });
    };

    return CafeShift;
};
