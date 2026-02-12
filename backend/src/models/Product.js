const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'categories',
                key: 'id'
            }
        },
        brand_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'brands',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        name_kh: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'Khmer name'
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
            comment: 'Cost price in USD'
        },
        selling_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Selling price in USD'
        },
        is_serialized: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'True if this product requires IMEI/Serial tracking'
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'For non-serialized items only'
        },
        low_stock_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 5
        },
        storage_capacity: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'e.g., 128GB, 256GB'
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
        indexes: [
            { fields: ['sku'] },
            { fields: ['barcode'] },
            { fields: ['name'] },
            { fields: ['category_id'] },
            { fields: ['brand_id'] }
        ]
    });

    // Virtual getter for stock status
    Product.prototype.getStockStatus = function () {
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

    return Product;
};
