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
