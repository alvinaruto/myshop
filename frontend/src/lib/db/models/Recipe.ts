import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Recipe = sequelize.define('Recipe', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ingredient_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Size variant this recipe is for
        size: {
            type: DataTypes.ENUM('regular', 'medium', 'large'),
            defaultValue: 'regular'
        },
        // Quantity of ingredient needed for this size
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'recipes',
        underscored: true,
        indexes: [
            { fields: ['menu_item_id'] },
            { fields: ['ingredient_id'] },
            { fields: ['menu_item_id', 'size'] }
        ]
    });

    (Recipe as any).associate = (models: any) => {
        Recipe.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });
        Recipe.belongsTo(models.Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });
    };

    return Recipe;
};
