const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SaleItem = sequelize.define('SaleItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sales',
                key: 'id'
            }
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        serial_item_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'serial_items',
                key: 'id'
            },
            comment: 'For serialized items only'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        unit_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: 'Price per unit in USD'
        },
        cost_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: 'Cost price for profit calculation'
        },
        discount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: '(unit_price * quantity) - discount'
        }
    }, {
        tableName: 'sale_items',
        indexes: [
            { fields: ['sale_id'] },
            { fields: ['product_id'] },
            { fields: ['serial_item_id'] }
        ]
    });

    // Calculate total before save
    SaleItem.addHook('beforeSave', (item) => {
        item.total = (parseFloat(item.unit_price) * item.quantity) - parseFloat(item.discount || 0);
    });

    return SaleItem;
};
