import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const sale = await models.Sale.findByPk(params.id, {
            include: [
                {
                    model: models.SaleItem,
                    as: 'items',
                    include: [
                        { model: models.Product, as: 'product' },
                        {
                            model: models.SerialItem,
                            as: 'serialItem',
                            include: [{ model: models.Warranty, as: 'warranty' }]
                        }
                    ]
                },
                { model: models.User, as: 'cashier', attributes: ['id', 'full_name'] }
            ]
        });

        if (!sale) return NextResponse.json({ success: false, message: 'Sale not found' }, { status: 404 });

        // Hide cost info for cashiers
        if (auth.role === 'cashier') {
            const saleJson = (sale as any).toJSON();
            saleJson.items = saleJson.items.map((item: any) => {
                delete item.cost_price;
                if (item.product) delete item.product.cost_price;
                return item;
            });
            return NextResponse.json({ success: true, data: saleJson });
        }

        return NextResponse.json({ success: true, data: sale });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
