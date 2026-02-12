const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Brand = require('./Brand')(sequelize);
const Product = require('./Product')(sequelize);
const SerialItem = require('./SerialItem')(sequelize);
const ExchangeRate = require('./ExchangeRate')(sequelize);
const Customer = require('./Customer')(sequelize);
const Sale = require('./Sale')(sequelize);
const SaleItem = require('./SaleItem')(sequelize);
const Warranty = require('./Warranty')(sequelize);

// Define associations
// Category -> Products
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Brand -> Products
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// Product -> SerialItems
Product.hasMany(SerialItem, { foreignKey: 'product_id', as: 'serialItems' });
SerialItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User -> ExchangeRates
User.hasMany(ExchangeRate, { foreignKey: 'set_by', as: 'exchangeRates' });
ExchangeRate.belongsTo(User, { foreignKey: 'set_by', as: 'setByUser' });

// User -> Sales (cashier)
User.hasMany(Sale, { foreignKey: 'cashier_id', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });

// Customer -> Sales
Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Sale -> SaleItems
Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

// Product -> SaleItems
Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'saleItems' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// SerialItem -> SaleItem
SerialItem.hasOne(SaleItem, { foreignKey: 'serial_item_id', as: 'saleItem' });
SaleItem.belongsTo(SerialItem, { foreignKey: 'serial_item_id', as: 'serialItem' });

// SerialItem -> Sale (for tracking when sold)
Sale.hasMany(SerialItem, { foreignKey: 'sale_id', as: 'serialItems' });
SerialItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

// SerialItem -> Warranty
SerialItem.hasOne(Warranty, { foreignKey: 'serial_item_id', as: 'warranty' });
Warranty.belongsTo(SerialItem, { foreignKey: 'serial_item_id', as: 'serialItem' });

// Sale -> Warranty
Sale.hasMany(Warranty, { foreignKey: 'sale_id', as: 'warranties' });
Warranty.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

module.exports = {
    sequelize,
    User,
    Category,
    Brand,
    Product,
    SerialItem,
    ExchangeRate,
    Customer,
    Sale,
    SaleItem,
    Warranty
};
