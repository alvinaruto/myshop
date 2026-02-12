import { NextRequest, NextResponse } from 'next/server';
import { getSequelize } from '@/lib/db';

// POST /api/migrate - Run database migrations
export async function POST(request: NextRequest) {
    try {
        const sequelize = getSequelize();

        // Get the secret from query params for basic protection
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'myshop-migrate-2024') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const migrations: string[] = [];

        // Migration 1: Make cashier_id nullable in cafe_orders
        try {
            await sequelize.query(`
                ALTER TABLE cafe_orders 
                ALTER COLUMN cashier_id DROP NOT NULL
            `);
            migrations.push('cafe_orders.cashier_id: Made nullable');
        } catch (e: any) {
            if (e.message.includes('does not exist') || e.message.includes('already')) {
                migrations.push('cafe_orders.cashier_id: Already nullable or table does not exist');
            } else {
                migrations.push(`cafe_orders.cashier_id: Error - ${e.message}`);
            }
        }

        // Migration 2: Add customer_id column
        try {
            await sequelize.query(`
                ALTER TABLE cafe_orders 
                ADD COLUMN IF NOT EXISTS customer_id UUID
            `);
            migrations.push('cafe_orders.customer_id: Added');
        } catch (e: any) {
            migrations.push(`cafe_orders.customer_id: ${e.message}`);
        }

        // Migration 3: Add table_number column
        try {
            await sequelize.query(`
                ALTER TABLE cafe_orders 
                ADD COLUMN IF NOT EXISTS table_number INTEGER
            `);
            migrations.push('cafe_orders.table_number: Added');
        } catch (e: any) {
            migrations.push(`cafe_orders.table_number: ${e.message}`);
        }

        // Migration 4: Add order_type column
        try {
            // First create the enum type if it doesn't exist
            await sequelize.query(`
                DO $$ BEGIN
                    CREATE TYPE enum_cafe_orders_order_type AS ENUM ('dine_in', 'takeaway');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            await sequelize.query(`
                ALTER TABLE cafe_orders 
                ADD COLUMN IF NOT EXISTS order_type enum_cafe_orders_order_type DEFAULT 'takeaway'
            `);
            migrations.push('cafe_orders.order_type: Added');
        } catch (e: any) {
            migrations.push(`cafe_orders.order_type: ${e.message}`);
        }

        // Migration 5: Create new tables for additional features
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS cafe_customers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(100),
                    email VARCHAR(255),
                    loyalty_points INTEGER DEFAULT 0,
                    tier VARCHAR(20) DEFAULT 'bronze',
                    total_spent DECIMAL(12,2) DEFAULT 0,
                    total_orders INTEGER DEFAULT 0,
                    last_visit TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('cafe_customers: Created');
        } catch (e: any) {
            migrations.push(`cafe_customers: ${e.message}`);
        }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS menu_modifiers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL,
                    name_kh VARCHAR(100),
                    category VARCHAR(50) DEFAULT 'extras',
                    price DECIMAL(10,2) DEFAULT 0,
                    is_available BOOLEAN DEFAULT true,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('menu_modifiers: Created');
        } catch (e: any) {
            migrations.push(`menu_modifiers: ${e.message}`);
        }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS menu_combos (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL,
                    name_kh VARCHAR(100),
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    original_price DECIMAL(10,2),
                    items JSONB DEFAULT '[]',
                    image_url VARCHAR(500),
                    is_active BOOLEAN DEFAULT true,
                    valid_from TIMESTAMP,
                    valid_until TIMESTAMP,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('menu_combos: Created');
        } catch (e: any) {
            migrations.push(`menu_combos: ${e.message}`);
        }

        try {
            await sequelize.query(`
                DO $$ BEGIN
                    CREATE TYPE enum_happy_hours_discount_type AS ENUM ('percentage', 'fixed');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS happy_hours (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    discount_type enum_happy_hours_discount_type DEFAULT 'percentage',
                    discount_value DECIMAL(10,2) NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}',
                    category_id UUID,
                    menu_item_ids UUID[] DEFAULT '{}',
                    applies_to_all BOOLEAN DEFAULT false,
                    is_active BOOLEAN DEFAULT true,
                    valid_from DATE,
                    valid_until DATE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('happy_hours: Created');
        } catch (e: any) {
            migrations.push(`happy_hours: ${e.message}`);
        }

        try {
            await sequelize.query(`
                DO $$ BEGIN
                    CREATE TYPE enum_cafe_shifts_status AS ENUM ('open', 'closed');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS cafe_shifts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    cashier_id UUID NOT NULL,
                    start_time TIMESTAMP DEFAULT NOW(),
                    end_time TIMESTAMP,
                    opening_cash_usd DECIMAL(12,2) DEFAULT 0,
                    opening_cash_khr DECIMAL(15,0) DEFAULT 0,
                    closing_cash_usd DECIMAL(12,2),
                    closing_cash_khr DECIMAL(15,0),
                    expected_cash_usd DECIMAL(12,2),
                    expected_cash_khr DECIMAL(15,0),
                    discrepancy_usd DECIMAL(12,2),
                    total_sales_usd DECIMAL(12,2) DEFAULT 0,
                    total_orders INTEGER DEFAULT 0,
                    status enum_cafe_shifts_status DEFAULT 'open',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('cafe_shifts: Created');
        } catch (e: any) {
            migrations.push(`cafe_shifts: ${e.message}`);
        }

        try {
            await sequelize.query(`
                DO $$ BEGIN
                    CREATE TYPE enum_cafe_tables_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS cafe_tables (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    table_number INTEGER UNIQUE NOT NULL,
                    name VARCHAR(50),
                    capacity INTEGER DEFAULT 4,
                    status enum_cafe_tables_status DEFAULT 'available',
                    current_order_id UUID,
                    section VARCHAR(50),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            migrations.push('cafe_tables: Created');
        } catch (e: any) {
            migrations.push(`cafe_tables: ${e.message}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Migrations completed',
            migrations
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// GET - Show available migrations
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Migration endpoint. POST with ?secret=myshop-migrate-2024 to run migrations.',
        availableMigrations: [
            'cafe_orders.cashier_id: Make nullable'
        ]
    });
}
