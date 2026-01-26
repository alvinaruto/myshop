import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await models.Product.findByPk(params.id, {
            include: [
                { model: models.Category, as: 'category' },
                { model: models.Brand, as: 'brand' },
                {
                    model: models.SerialItem,
                    as: 'serialItems',
                    where: { status: 'in_stock' },
                    required: false
                }
            ]
        });

        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        const result = product.toJSON();
        // Hide cost price for public view
        delete result.cost_price;

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
