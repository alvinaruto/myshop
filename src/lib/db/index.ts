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

// Lazy-loaded singleton instances
let sequelizeInstance: Sequelize | null = null;
let modelsInstance: ReturnType<typeof initializeModels> | null = null;

function getSequelize(): Sequelize {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }

    const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
    }

    if (process.env.NODE_ENV === 'production') {
        sequelizeInstance = new Sequelize(DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: pg,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: false,
            pool: {
                max: 2,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
    } else {
        // Check if DATABASE_URL contains SSL requirement (e.g., Supabase in dev)
        const needsSSL = DATABASE_URL.includes('supabase') || DATABASE_URL.includes('sslmode');
        sequelizeInstance = new Sequelize(DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: pg,
            dialectOptions: needsSSL ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : undefined,
            logging: false,
        });
    }

    return sequelizeInstance;
}

function initializeModels(sequelize: Sequelize) {
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

    return models;
}

function getModels() {
    if (modelsInstance) {
        return modelsInstance;
    }

    const sequelize = getSequelize();
    modelsInstance = initializeModels(sequelize);
    return modelsInstance;
}

// For backwards compatibility, use getters that lazy-load
// These will throw at build time if accessed, which is the correct behavior
const sequelize = new Proxy({} as Sequelize, {
    get(_, prop) {
        return (getSequelize() as any)[prop];
    }
});

const models = new Proxy({} as ReturnType<typeof initializeModels>, {
    get(_, prop) {
        return (getModels() as any)[prop];
    }
});

export { sequelize, models, getSequelize, getModels };
export default sequelize;
