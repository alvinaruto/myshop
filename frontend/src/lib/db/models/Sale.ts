// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        invoice_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
        },
        cashier_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
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
            type: DataTypes.ENUM('completed', 'voided', 'refunded'),
            defaultValue: 'completed'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'sales',
        underscored: true,
        indexes: [
            { fields: ['invoice_number'] },
            { fields: ['cashier_id'] },
            { fields: ['customer_id'] },
            { fields: ['created_at'] },
            { fields: ['status'] }
        ]
    });

    (Sale as any).associate = (models: any) => {
        Sale.belongsTo(models.User, { foreignKey: 'cashier_id', as: 'cashier' });
        Sale.hasMany(models.SaleItem, { foreignKey: 'sale_id', as: 'items' });
        Sale.hasMany(models.Warranty, { foreignKey: 'sale_id', as: 'warranties' });
    };

    // Generate invoice number before validation
    Sale.addHook('beforeValidate', async (sale: any) => {
        if (!sale.invoice_number) {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const count = await Sale.count({
                where: sequelize.where(
                    sequelize.fn('DATE', sequelize.col('created_at')),
                    today.toISOString().slice(0, 10)
                )
            });
            sale.invoice_number = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }
    });

    return Sale;
};
