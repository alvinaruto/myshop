import { NextRequest, NextResponse } from 'next/server';
import { models, getSequelize } from '@/lib/db';

// POST /api/cafe/ingredients/[id]/stock - Adjust stock
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
        const body = await request.json();
        const { type, quantity, notes, created_by } = body;

        if (!type || quantity === undefined) {
            return NextResponse.json(
                { success: false, message: 'Type and quantity are required' },
                { status: 400 }
            );
        }

        const ingredient = await models.Ingredient.findByPk(params.id, { transaction });

        if (!ingredient) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Ingredient not found' },
                { status: 404 }
            );
        }

        const currentQty = parseFloat((ingredient as any).quantity);
        let newQty = currentQty;
        let stockQty = parseFloat(quantity);

        switch (type) {
            case 'in':
                newQty = currentQty + stockQty;
                break;
            case 'out':
            case 'waste':
                newQty = currentQty - stockQty;
                stockQty = -stockQty; // Store as negative
                break;
            case 'adjustment':
                newQty = stockQty; // Set absolute value
                stockQty = stockQty - currentQty; // Calculate difference
                break;
            default:
                await transaction.rollback();
                return NextResponse.json(
                    { success: false, message: 'Invalid type. Use: in, out, waste, adjustment' },
                    { status: 400 }
                );
        }

        if (newQty < 0) {
            await transaction.rollback();
            return NextResponse.json(
                { success: false, message: 'Insufficient stock' },
                { status: 400 }
            );
        }

        // Update ingredient quantity
        await ingredient.update({ quantity: newQty }, { transaction });

        // Create stock transaction record
        await models.StockTransaction.create({
            ingredient_id: params.id,
            type,
            quantity: stockQty,
            reference_type: 'manual',
            notes,
            created_by
        }, { transaction });

        await transaction.commit();

        return NextResponse.json({
            success: true,
            data: {
                ...(ingredient as any).toJSON(),
                stock_status: (ingredient as any).getStockStatus()
            },
            message: `Stock ${type === 'in' ? 'added' : type === 'adjustment' ? 'adjusted' : 'reduced'} successfully`
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error adjusting stock:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
