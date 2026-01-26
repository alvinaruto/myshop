import { Sequelize } from 'sequelize';
import pg from 'pg';

// Define Models (Imported below)
import defineUser from './models/User';
import defineProduct from './models/Product';
import defineCategory from './models/Category';
import defineBrand from './models/Brand';
import defineSerialItem from './models/SerialItem';
import defineSale from './models/Sale';
import defineSaleItem from './models/SaleItem';
import defineWarranty from './models/Warranty';
import defineExchangeRate from './models/ExchangeRate';

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not defined. Database connectivity will fail.');
}

// Nextjs / Vercel Serverless Connection Singleton
let sequelize: Sequelize;

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(DATABASE_URL!, {
        dialect: 'postgres',
        dialectModule: pg,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    });
} else {
    // Local development often doesn't need SSL
    sequelize = new Sequelize(DATABASE_URL!, {
        dialect: 'postgres',
        dialectModule: pg,
        logging: false,
    });
}

// Initialize models
const models = {
    User: defineUser(sequelize),
    Product: defineProduct(sequelize),
    Category: defineCategory(sequelize),
    Brand: defineBrand(sequelize),
    SerialItem: defineSerialItem(sequelize),
    Sale: defineSale(sequelize),
    SaleItem: defineSaleItem(sequelize),
    Warranty: defineWarranty(sequelize),
    ExchangeRate: defineExchangeRate(sequelize),
};

// Define Associations
Object.keys(models).forEach((modelName) => {
    if ((models as any)[modelName].associate) {
        (models as any)[modelName].associate(models);
    }
});

export { sequelize, models };
export default sequelize;
