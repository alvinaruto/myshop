const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface) => {
        const now = new Date();

        // Create admin user
        await queryInterface.bulkInsert('users', [{
            id: '00000000-0000-0000-0000-000000000001',
            username: 'admin',
            password_hash: await bcrypt.hash('admin123', 12),
            full_name: 'System Admin',
            role: 'admin',
            is_active: true,
            created_at: now,
            updated_at: now
        }, {
            id: '00000000-0000-0000-0000-000000000002',
            username: 'manager',
            password_hash: await bcrypt.hash('manager123', 12),
            full_name: 'Store Manager',
            role: 'manager',
            is_active: true,
            created_at: now,
            updated_at: now
        }, {
            id: '00000000-0000-0000-0000-000000000003',
            username: 'cashier1',
            password_hash: await bcrypt.hash('cashier123', 12),
            full_name: 'Main Cashier',
            role: 'cashier',
            is_active: true,
            created_at: now,
            updated_at: now
        }]);

        // Create categories
        await queryInterface.bulkInsert('categories', [
            { id: '10000000-0000-0000-0000-000000000001', name: 'Smartphones', name_kh: 'ទូរសព្ទឆ្លាតវៃ', is_serialized: true, created_at: now, updated_at: now },
            { id: '10000000-0000-0000-0000-000000000002', name: 'Laptops', name_kh: 'កុំព្យូទ័រយួរដៃ', is_serialized: true, created_at: now, updated_at: now },
            { id: '10000000-0000-0000-0000-000000000003', name: 'Tablets', name_kh: 'ថេប្លេត', is_serialized: true, created_at: now, updated_at: now },
            { id: '10000000-0000-0000-0000-000000000004', name: 'Accessories', name_kh: 'គ្រឿងបន្សំ', is_serialized: false, created_at: now, updated_at: now },
            { id: '10000000-0000-0000-0000-000000000005', name: 'Chargers & Cables', name_kh: 'ឆ្នាំង និង ខ្សែ', is_serialized: false, created_at: now, updated_at: now },
            { id: '10000000-0000-0000-0000-000000000006', name: 'Cases & Covers', name_kh: 'ស្រោម', is_serialized: false, created_at: now, updated_at: now }
        ]);

        // Create brands
        await queryInterface.bulkInsert('brands', [
            { id: '20000000-0000-0000-0000-000000000001', name: 'Apple', is_active: true, created_at: now, updated_at: now },
            { id: '20000000-0000-0000-0000-000000000002', name: 'Samsung', is_active: true, created_at: now, updated_at: now },
            { id: '20000000-0000-0000-0000-000000000003', name: 'Xiaomi', is_active: true, created_at: now, updated_at: now },
            { id: '20000000-0000-0000-0000-000000000004', name: 'OPPO', is_active: true, created_at: now, updated_at: now },
            { id: '20000000-0000-0000-0000-000000000005', name: 'Vivo', is_active: true, created_at: now, updated_at: now },
            { id: '20000000-0000-0000-0000-000000000006', name: 'Anker', is_active: true, created_at: now, updated_at: now }
        ]);

        // Set default exchange rate
        await queryInterface.bulkInsert('exchange_rates', [{
            id: '30000000-0000-0000-0000-000000000001',
            rate_date: now.toISOString().slice(0, 10),
            usd_to_khr: 4100,
            set_by: '00000000-0000-0000-0000-000000000001',
            created_at: now,
            updated_at: now
        }]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('exchange_rates', null, {});
        await queryInterface.bulkDelete('brands', null, {});
        await queryInterface.bulkDelete('categories', null, {});
        await queryInterface.bulkDelete('users', null, {});
    }
};
