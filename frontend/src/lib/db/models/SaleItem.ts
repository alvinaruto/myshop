// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const SaleItem = sequelize.define('SaleItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        serial_item_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        unit_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        cost_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        discount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        }
    }, {
        tableName: 'sale_items',
        underscored: true,
        indexes: [
            { fields: ['sale_id'] },
            { fields: ['product_id'] },
            { fields: ['serial_item_id'] }
        ]
    });

    (SaleItem as any).associate = (models: any) => {
        SaleItem.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale' });
        SaleItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
        SaleItem.belongsTo(models.SerialItem, { foreignKey: 'serial_item_id', as: 'serialItem' });
    };

    // Calculate total before save
    SaleItem.addHook('beforeSave', (item: any) => {
        item.total = (parseFloat(item.unit_price) * item.quantity) - parseFloat(item.discount || 0);
    });

    return SaleItem;
};
