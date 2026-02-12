// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const MenuCategory = sequelize.define('MenuCategory', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        name_kh: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: '☕'
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'menu_categories',
        underscored: true
    });

    (MenuCategory as any).associate = (models: any) => {
        MenuCategory.hasMany(models.MenuItem, { foreignKey: 'category_id', as: 'items' });
    };

    return MenuCategory;
};
