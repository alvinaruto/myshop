import { NextRequest, NextResponse } from 'next/server';
import { models, sequelize } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const transaction = await sequelize.transaction();

    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return forbiddenResponse();
        }

        const { product_id, items } = await req.json();

        if (!product_id) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 });
        }

        // Verify product exists and is serialized
        const product = await models.Product.findByPk(product_id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        if (!(product as any).is_serialized) {
            return NextResponse.json({ success: false, message: 'Product is not serialized' }, { status: 400 });
        }

        const created: any[] = [];
        const errors: string[] = [];

        for (const item of items) {
            const imei = item.imei?.trim();
            const serial_number = item.serial_number?.trim();

            if (!imei && !serial_number) {
                errors.push('Item must have IMEI or Serial Number');
                continue;
            }

            // Check for duplicates
            if (imei) {
                const existing = await models.SerialItem.findOne({
                    where: { imei },
                    transaction
                });
                if (existing) {
                    errors.push(`IMEI ${imei} already exists`);
                    continue;
                }
            }

            if (serial_number) {
                const existing = await models.SerialItem.findOne({
                    where: { serial_number },
                    transaction
                });
                if (existing) {
                    errors.push(`Serial ${serial_number} already exists`);
                    continue;
                }
            }

            // Create the serial item
            const serialItem = await models.SerialItem.create({
                product_id,
                imei: imei || null,
                serial_number: serial_number || null,
                status: 'in_stock',
                cost_price: item.cost_price || (product as any).cost_price,
            }, { transaction });

            created.push(serialItem);
        }

        if (created.length === 0) {
            await transaction.rollback();
            return NextResponse.json({
                success: false,
                message: 'No items were added',
                errors
            }, { status: 400 });
        }

        await transaction.commit();

        return NextResponse.json({
            success: true,
            message: `Added ${created.length} serial items`,
            data: {
                created: created.length,
                errors: errors.length > 0 ? errors : undefined
            }
        }, { status: 201 });

    } catch (error: any) {
        await transaction.rollback();
        console.error('Bulk serial items error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
