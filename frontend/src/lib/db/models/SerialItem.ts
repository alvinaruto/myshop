// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const SerialItem = sequelize.define('SerialItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        imei: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: /^[0-9]{15}$/i // IMEI is exactly 15 digits
            }
        },
        serial_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('in_stock', 'sold', 'returned', 'defective'),
            defaultValue: 'in_stock'
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        sold_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        cost_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'serial_items',
        underscored: true,
        indexes: [
            { fields: ['imei'], unique: true },
            { fields: ['serial_number'], unique: true },
            { fields: ['product_id'] },
            { fields: ['status'] },
            { fields: ['sale_id'] }
        ]
    });

    (SerialItem as any).associate = (models: any) => {
        SerialItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
        SerialItem.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale' });
        SerialItem.hasOne(models.Warranty, { foreignKey: 'serial_item_id', as: 'warranty' });
    };

    // Validate that at least IMEI or serial_number is provided
    SerialItem.addHook('beforeValidate', (item: any) => {
        if (!item.imei && !item.serial_number) {
            throw new Error('Either IMEI or Serial Number must be provided');
        }
    });

    return SerialItem;
};
