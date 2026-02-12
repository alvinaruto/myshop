import { NextResponse } from 'next/server';
import { getSequelize } from '@/lib/db';
import { QueryTypes } from 'sequelize';

/**
 * Migration: Add notes column to cafe_orders table
 * 
 * This migration adds the notes field to allow customers
 * to add special instructions to their orders.
 */
export async function POST() {
    try {
        const sequelize = getSequelize();

        // Check if column already exists
        const [columns] = await sequelize.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = 'cafe_orders' AND column_name = 'notes'`,
            { type: QueryTypes.SELECT }
        ) as any;

        if (columns) {
            return NextResponse.json({
                success: true,
                message: 'Column notes already exists'
            });
        }

        // Add the column
        await sequelize.query(
            `ALTER TABLE cafe_orders ADD COLUMN notes TEXT NULL`
        );

        return NextResponse.json({
            success: true,
            message: 'Successfully added notes column to cafe_orders table'
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
        migration: 'add_notes_to_orders',
        table: 'cafe_orders',
        description: 'Adds notes column for order special instructions',
        method: 'POST to apply'
    });
}
