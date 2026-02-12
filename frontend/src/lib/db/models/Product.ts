import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        brand_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        name_kh: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        model: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        barcode: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true
        },
        cost_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        selling_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        is_serialized: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        low_stock_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 5
        },
        storage_capacity: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        condition: {
            type: DataTypes.ENUM('new', 'secondhand'),
            defaultValue: 'new'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'products',
        underscored: true,
        indexes: [
            { fields: ['sku'] },
            { fields: ['barcode'] },
            { fields: ['name'] },
            { fields: ['category_id'] },
            { fields: ['brand_id'] }
        ]
    });

    (Product.prototype as any).getStockStatus = function () {
        if (this.is_serialized) {
            return 'serialized';
        }
        if (this.quantity <= 0) {
            return 'out_of_stock';
        }
        if (this.quantity <= this.low_stock_threshold) {
            return 'low_stock';
        }
        return 'in_stock';
    };

    (Product as any).associate = (models: any) => {
        Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
        Product.belongsTo(models.Brand, { foreignKey: 'brand_id', as: 'brand' });
        Product.hasMany(models.SerialItem, { foreignKey: 'product_id', as: 'serialItems' });
    };

    return Product;
};
