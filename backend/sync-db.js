#!/usr/bin/env node
/**
 * One-time DB sync script.
 * Run this against your Supabase DATABASE_URL to create all tables.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node sync-db.js
 * OR (if you have the URL in .env.production):
 *   node -e "require('dotenv').config({path:'.env.production'})" sync-db.js
 */

require('dotenv').config(); // loads .env by default

// Override DATABASE_URL from CLI arg if supplied
// e.g. node sync-db.js "postgresql://user:pass@host/db"
if (process.argv[2]) {
    process.env.DATABASE_URL = process.argv[2];
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
    console.error('❌  Please provide a Supabase DATABASE_URL (not localhost).');
    console.error('    node sync-db.js "postgresql://user:pass@xxx.supabase.co:5432/postgres"');
    process.exit(1);
}

// Force production mode so SSL is used
process.env.NODE_ENV = 'production';

const { sequelize } = require('./src/models');

(async () => {
    try {
        console.log('🔌 Connecting to:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
        await sequelize.authenticate();
        console.log('✅ Connected successfully.\n');

        console.log('🔄 Running sequelize.sync({ alter: true }) ...');
        await sequelize.sync({ alter: true });
        console.log('✅ All tables created / updated.\n');

        const [results] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
        );
        console.log('📋 Tables now in database:');
        results.forEach(r => console.log('   -', r.table_name));

        await sequelize.close();
        console.log('\n🎉 Done! Your Supabase DB is ready.');
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    }
})();
