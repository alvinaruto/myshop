// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const MenuItem = sequelize.define('MenuItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        name_kh: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        // Base price for Regular size (USD)
        base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        // Size options
        has_sizes: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        price_medium: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        price_large: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        // Customization options
        has_sugar_option: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        has_ice_option: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        // Availability
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'menu_items',
        underscored: true,
        indexes: [
            { fields: ['category_id'] },
            { fields: ['name'] },
            { fields: ['is_available'] },
            { fields: ['is_active'] }
        ]
    });

    (MenuItem as any).associate = (models: any) => {
        MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'category_id', as: 'category' });
        MenuItem.hasMany(models.Recipe, { foreignKey: 'menu_item_id', as: 'recipes' });
    };

    // Helper to get price by size
    (MenuItem.prototype as any).getPriceBySize = function (size: 'regular' | 'medium' | 'large') {
        switch (size) {
            case 'medium':
                return this.price_medium || (parseFloat(this.base_price) + 0.50);
            case 'large':
                return this.price_large || (parseFloat(this.base_price) + 1.00);
            default:
                return parseFloat(this.base_price);
        }
    };

    return MenuItem;
};
