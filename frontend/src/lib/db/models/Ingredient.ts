// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Ingredient = sequelize.define('Ingredient', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        name_kh: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        // Unit of measurement (g, ml, pcs, etc.)
        unit: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'pcs'
        },
        // Cost per unit in USD
        cost_per_unit: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false,
            defaultValue: 0
        },
        // Current stock quantity
        quantity: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        // Alert threshold
        low_stock_threshold: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 10
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'ingredients',
        underscored: true,
        indexes: [
            { fields: ['name'] },
            { fields: ['is_active'] }
        ]
    });

    (Ingredient.prototype as any).getStockStatus = function () {
        const qty = parseFloat(this.quantity);
        const threshold = parseFloat(this.low_stock_threshold);
        if (qty <= 0) {
            return 'out_of_stock';
        }
        if (qty <= threshold) {
            return 'low_stock';
        }
        return 'in_stock';
    };

    (Ingredient as any).associate = (models: any) => {
        Ingredient.hasMany(models.Recipe, { foreignKey: 'ingredient_id', as: 'recipes' });
        Ingredient.hasMany(models.StockTransaction, { foreignKey: 'ingredient_id', as: 'transactions' });
    };

    return Ingredient;
};
