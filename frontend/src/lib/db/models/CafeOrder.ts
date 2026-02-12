// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const CafeOrder = sequelize.define('CafeOrder', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
        },
        cashier_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        table_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        order_type: {
            type: DataTypes.ENUM('dine_in', 'takeaway'),
            defaultValue: 'takeaway'
        },
        // Totals in USD
        subtotal_usd: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        discount_usd: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        total_usd: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        // Payment amounts
        paid_usd: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        paid_khr: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: 0
        },
        change_usd: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        change_khr: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: 0
        },
        exchange_rate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'card', 'khqr', 'split'),
            defaultValue: 'cash'
        },
        khqr_reference: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'preparing', 'ready', 'completed', 'voided'),
            defaultValue: 'completed'
        }
    }, {
        tableName: 'cafe_orders',
        underscored: true,
        indexes: [
            { fields: ['order_number'] },
            { fields: ['cashier_id'] },
            { fields: ['created_at'] },
            { fields: ['status'] }
        ]
    });

    (CafeOrder as any).associate = (models: any) => {
        CafeOrder.belongsTo(models.User, { foreignKey: 'cashier_id', as: 'cashier' });
        CafeOrder.belongsTo(models.CafeCustomer, { foreignKey: 'customer_id', as: 'customer' });
        CafeOrder.hasMany(models.CafeOrderItem, { foreignKey: 'order_id', as: 'items' });
    };

    // Generate order number before validation
    CafeOrder.addHook('beforeValidate', async (order: any) => {
        if (!order.order_number) {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const count = await CafeOrder.count({
                where: sequelize.where(
                    sequelize.fn('DATE', sequelize.col('created_at')),
                    today.toISOString().slice(0, 10)
                )
            });
            order.order_number = `CAFE-${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }
    });

    return CafeOrder;
};
