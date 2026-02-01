import { NextResponse } from 'next/server';
import { getSequelize } from '@/lib/db';
import { QueryTypes } from 'sequelize';

/**
 * Migration: Add telegram_chat_id column to cafe_customers table
 * 
 * This migration adds the telegram_chat_id field to allow customers
 * to receive order status notifications via Telegram.
 */
export async function POST() {
    try {
        const sequelize = getSequelize();

        // Check if column already exists
        const [columns] = await sequelize.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = 'cafe_customers' AND column_name = 'telegram_chat_id'`,
            { type: QueryTypes.SELECT }
        ) as any;

        if (columns) {
            return NextResponse.json({
                success: true,
                message: 'Column telegram_chat_id already exists'
            });
        }

        // Add the column
        await sequelize.query(
            `ALTER TABLE cafe_customers ADD COLUMN telegram_chat_id VARCHAR(50) NULL`
        );

        return NextResponse.json({
            success: true,
            message: 'Successfully added telegram_chat_id column to cafe_customers table'
        });

    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        migration: 'add_telegram_chat_id',
        table: 'cafe_customers',
        description: 'Adds telegram_chat_id column for customer Telegram notifications',
        method: 'POST to apply'
    });
}
