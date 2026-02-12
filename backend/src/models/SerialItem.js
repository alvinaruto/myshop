const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SerialItem = sequelize.define('SerialItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        imei: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: /^[0-9]{15}$/i // IMEI is exactly 15 digits
            },
            comment: 'IMEI for phones'
        },
        serial_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Serial number for laptops/devices'
        },
        status: {
            type: DataTypes.ENUM('in_stock', 'sold', 'returned', 'defective'),
            defaultValue: 'in_stock'
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'sales',
                key: 'id'
            },
            comment: 'Reference to sale when sold'
        },
        sold_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        cost_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: 'Individual cost price if different from product'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'serial_items',
        indexes: [
            { fields: ['imei'], unique: true },
            { fields: ['serial_number'], unique: true },
            { fields: ['product_id'] },
            { fields: ['status'] },
            { fields: ['sale_id'] }
        ]
    });

    // Validate that at least IMEI or serial_number is provided
    SerialItem.addHook('beforeValidate', (item) => {
        if (!item.imei && !item.serial_number) {
            throw new Error('Either IMEI or Serial Number must be provided');
        }
    });

    return SerialItem;
};
