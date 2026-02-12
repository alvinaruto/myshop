import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';

// GET /api/cafe/tables - List all tables
export async function GET(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const status = searchParams.get('status');

        const where: any = { is_active: true };
        if (section) where.section = section;
        if (status) where.status = status;

        const tables = await models.CafeTable.findAll({
            where,
            order: [['table_number', 'ASC']]
        });

        // Get distinct sections
        const sections = Array.from(new Set(tables.map((t: any) => t.section).filter(Boolean)));

        return NextResponse.json({
            success: true,
            data: { tables, sections }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/cafe/tables - Create a table
export async function POST(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { table_number, name, capacity, section } = body;

        if (!table_number) {
            return NextResponse.json(
                { success: false, message: 'Table number is required' },
                { status: 400 }
            );
        }

        // Check if table number exists
        const existing = await models.CafeTable.findOne({ where: { table_number } });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Table number already exists' },
                { status: 400 }
            );
        }

        const table = await models.CafeTable.create({
            table_number,
            name,
            capacity: capacity || 4,
            section
        });

        return NextResponse.json({
            success: true,
            data: { table }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/cafe/tables - Update table status
export async function PATCH(request: NextRequest) {
    try {
        const models = getModels();
        const body = await request.json();
        const { id, table_number, status, current_order_id, ...updates } = body;

        const where = id ? { id } : { table_number };
        const table = await models.CafeTable.findOne({ where });

        if (!table) {
            return NextResponse.json(
                { success: false, message: 'Table not found' },
                { status: 404 }
            );
        }

        await table.update({
            ...(status && { status }),
            ...(current_order_id !== undefined && { current_order_id }),
            ...updates
        });

        return NextResponse.json({
            success: true,
            data: { table }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/cafe/tables - Delete or deactivate table
export async function DELETE(request: NextRequest) {
    try {
        const models = getModels();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const tableNumber = searchParams.get('table_number');

        const where = id ? { id } : { table_number: tableNumber };
        const table = await models.CafeTable.findOne({ where });

        if (!table) {
            return NextResponse.json(
                { success: false, message: 'Table not found' },
                { status: 404 }
            );
        }

        // Soft delete
        await table.update({ is_active: false });

        return NextResponse.json({
            success: true,
            message: 'Table deactivated'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
