import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const CafeOrderItem = sequelize.define('CafeOrderItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Item details (denormalized for history)
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        // Size variant
        size: {
            type: DataTypes.ENUM('regular', 'medium', 'large'),
            defaultValue: 'regular'
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        // Customizations as JSON
        customizations: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
            // Example: { sugar: 'less', ice: 'normal', extras: ['whipped cream'] }
        }
    }, {
        tableName: 'cafe_order_items',
        underscored: true,
        indexes: [
            { fields: ['order_id'] },
            { fields: ['menu_item_id'] }
        ]
    });

    // Calculate total before saving
    CafeOrderItem.addHook('beforeValidate', (item: any) => {
        item.total = (parseFloat(item.unit_price) * item.quantity) - parseFloat(item.discount || 0);
    });

    (CafeOrderItem as any).associate = (models: any) => {
        CafeOrderItem.belongsTo(models.CafeOrder, { foreignKey: 'order_id', as: 'order' });
        CafeOrderItem.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });
    };

    return CafeOrderItem;
};
