const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.log('Usage: DATABASE_URL=your_db_url node add-otp-columns.js');
    process.exit(1);
}

async function run() {
    // Strip SSL params for compatibility with the script's connection
    let cleanUrl = DATABASE_URL;
    if (cleanUrl.includes('?')) {
        const [base, query] = cleanUrl.split('?');
        const params = new URLSearchParams(query);
        params.delete('sslmode');
        params.delete('ssl');
        const newQuery = params.toString();
        cleanUrl = newQuery ? `${base}?${newQuery}` : base;
    }

    const client = new Client({
        connectionString: cleanUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        console.log('Adding missing columns to cafe_customers...');
        const query = `
      ALTER TABLE cafe_customers ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);
      ALTER TABLE cafe_customers ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP WITH TIME ZONE;
      ALTER TABLE cafe_customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
      ALTER TABLE cafe_customers ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'bronze';
      ALTER TABLE cafe_customers ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50);
    `;

        await client.query(query);
        console.log('Success! Columns added.');
    } catch (err) {
        console.error('Error executing SQL:', err.message);
    } finally {
        await client.end();
    }
}

run();
