require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Brand, ExchangeRate } = require('./src/models');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Wait for sync
        await sequelize.sync({ force: true });
        console.log('✅ Database synchronized');

        const now = new Date();

        // Check if admin exists
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists, skipping user seed');
        } else {
            // Create users
            const adminPassword = await bcrypt.hash('admin123', 12);
            const managerPassword = await bcrypt.hash('manager123', 12);
            const cashierPassword = await bcrypt.hash('cashier123', 12);

            await User.bulkCreate([
                {
                    username: 'admin',
                    password_hash: adminPassword,
                    full_name: 'System Admin',
                    role: 'admin',
                    is_active: true
                },
                {
                    username: 'manager',
                    password_hash: managerPassword,
                    full_name: 'Store Manager',
                    role: 'manager',
                    is_active: true
                },
                {
                    username: 'cashier1',
                    password_hash: cashierPassword,
                    full_name: 'Main Cashier',
                    role: 'cashier',
                    is_active: true
                }
            ]);
            console.log('✅ Users created');
        }

        // Check if categories exist
        const existingCats = await Category.count();
        if (existingCats === 0) {
            await Category.bulkCreate([
                { name: 'Smartphones', name_kh: 'ទូរសព្ទឆ្លាតវៃ', is_serialized: true },
                { name: 'Laptops', name_kh: 'កុំព្យូទ័រយួរដៃ', is_serialized: true },
                { name: 'Tablets', name_kh: 'ថេប្លេត', is_serialized: true },
                { name: 'Accessories', name_kh: 'គ្រឿងបន្សំ', is_serialized: false },
                { name: 'Chargers & Cables', name_kh: 'ឆ្នាំង និង ខ្សែ', is_serialized: false },
                { name: 'Cases & Covers', name_kh: 'ស្រោម', is_serialized: false }
            ]);
            console.log('✅ Categories created');
        }

        // Check if brands exist
        const existingBrands = await Brand.count();
        if (existingBrands === 0) {
            await Brand.bulkCreate([
                { name: 'Apple', is_active: true },
                { name: 'Samsung', is_active: true },
                { name: 'Xiaomi', is_active: true },
                { name: 'OPPO', is_active: true },
                { name: 'Vivo', is_active: true },
                { name: 'Anker', is_active: true },
                { name: 'Realme', is_active: true },
                { name: 'Huawei', is_active: true }
            ]);
            console.log('✅ Brands created');
        }

        // Set today's exchange rate
        const today = now.toISOString().slice(0, 10);
        const existingRate = await ExchangeRate.findOne({ where: { rate_date: today } });
        if (!existingRate) {
            const admin = await User.findOne({ where: { username: 'admin' } });
            if (admin) {
                await ExchangeRate.create({
                    rate_date: today,
                    usd_to_khr: 4100,
                    set_by: admin.id
                });
                console.log('✅ Exchange rate set: $1 = ៛4,100');
            }
        }

        console.log('\n🎉 Database seeding complete!\n');
        console.log('Default accounts:');
        console.log('  Admin:   admin / admin123');
        console.log('  Manager: manager / manager123');
        console.log('  Cashier: cashier1 / cashier123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
