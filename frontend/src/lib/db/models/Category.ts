import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Category = sequelize.define('Category', {
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
        is_serialized: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'categories',
        underscored: true
    });

    (Category as any).associate = (models: any) => {
        Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
    };

    return Category;
};
