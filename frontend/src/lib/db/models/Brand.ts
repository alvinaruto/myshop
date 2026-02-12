// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Brand = sequelize.define('Brand', {
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
        logo_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'brands',
        underscored: true
    });

    (Brand as any).associate = (models: any) => {
        Brand.hasMany(models.Product, { foreignKey: 'brand_id', as: 'products' });
    };

    return Brand;
};
