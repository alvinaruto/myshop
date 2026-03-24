#!/usr/bin/env node
/**
 * Safe seed script — inserts base data ONLY if it doesn't already exist.
 * Never drops or wipes existing data.
 *
 * Usage:
 *   node seed-safe.js "postgresql://..."
 *   OR just run after DATABASE_URL is set in environment.
 */

require('dotenv').config();

if (process.argv[2]) {
    process.env.DATABASE_URL = process.argv[2];
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
    console.error('❌  Please provide a Supabase DATABASE_URL (not localhost).');
    console.error('    node seed-safe.js "postgresql://user:pass@xxx.supabase.co:5432/postgres"');
    process.exit(1);
}

process.env.NODE_ENV = 'production';

const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Brand, ExchangeRate } = require('./src/models');

const seedDatabase = async () => {
    try {
        console.log('🔌 Connecting to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connected.\n');

        // Sync tables (alter only — never drops data)
        await sequelize.sync({ alter: true });
        console.log('✅ Tables synced.\n');

        // ── Users ────────────────────────────────────────────────────────
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (!existingAdmin) {
            await User.bulkCreate([
                { username: 'admin',    password_hash: await bcrypt.hash('admin123',   12), full_name: 'System Admin',   role: 'admin',   is_active: true },
                { username: 'manager',  password_hash: await bcrypt.hash('manager123', 12), full_name: 'Store Manager',  role: 'manager', is_active: true },
                { username: 'cashier1', password_hash: await bcrypt.hash('cashier123', 12), full_name: 'Main Cashier',  role: 'cashier', is_active: true },
            ]);
            console.log('✅ Staff users created.');
        } else {
            console.log('⏭️  Staff users already exist, skipped.');
        }

        // ── Categories ───────────────────────────────────────────────────
        const catCount = await Category.count();
        if (catCount === 0) {
            await Category.bulkCreate([
                { name: 'Smartphones',     name_kh: 'ទូរសព្ទឆ្លាតវៃ',       is_serialized: true  },
                { name: 'Laptops',         name_kh: 'កុំព្យូទ័រយួរដៃ',      is_serialized: true  },
                { name: 'Tablets',         name_kh: 'ថេប្លេត',               is_serialized: true  },
                { name: 'Accessories',     name_kh: 'គ្រឿងបន្សំ',           is_serialized: false },
                { name: 'Chargers & Cables', name_kh: 'ឆ្នាំង និង ខ្សែ',   is_serialized: false },
                { name: 'Cases & Covers',  name_kh: 'ស្រោម',                 is_serialized: false },
            ]);
            console.log('✅ Categories created.');
        } else {
            console.log(`⏭️  ${catCount} categories already exist, skipped.`);
        }

        // ── Brands ───────────────────────────────────────────────────────
        const brandCount = await Brand.count();
        if (brandCount === 0) {
            await Brand.bulkCreate([
                { name: 'Apple',   is_active: true },
                { name: 'Samsung', is_active: true },
                { name: 'Xiaomi',  is_active: true },
                { name: 'OPPO',    is_active: true },
                { name: 'Vivo',    is_active: true },
                { name: 'Anker',   is_active: true },
                { name: 'Realme',  is_active: true },
                { name: 'Huawei',  is_active: true },
            ]);
            console.log('✅ Brands created.');
        } else {
            console.log(`⏭️  ${brandCount} brands already exist, skipped.`);
        }

        // ── Exchange Rate ────────────────────────────────────────────────
        const today = new Date().toISOString().slice(0, 10);
        const existingRate = await ExchangeRate.findOne({ where: { rate_date: today } });
        if (!existingRate) {
            const admin = await User.findOne({ where: { username: 'admin' } });
            if (admin) {
                await ExchangeRate.create({ rate_date: today, usd_to_khr: 4100, set_by: admin.id });
                console.log('✅ Exchange rate set: $1 = ៛4,100');
            }
        } else {
            console.log('⏭️  Exchange rate already exists, skipped.');
        }

        console.log('\n🎉 Seed complete!');
        console.log('─────────────────────────────');
        console.log('  Admin:    admin / admin123');
        console.log('  Manager:  manager / manager123');
        console.log('  Cashier:  cashier1 / cashier123');
        console.log('─────────────────────────────');
        console.log('\n⚠️  Products are NOT in the seed — you need to re-add them via the Admin panel.\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
