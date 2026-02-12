import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';

export async function GET(
    req: NextRequest,
    { params }: { params: { serial: string } }
) {
    try {
        const { serial } = params;
        const warranty = await models.Warranty.findOne({
            include: [
                {
                    model: models.SerialItem,
                    as: 'serialItem',
                    where: {
                        [Op.or]: [
                            { imei: serial },
                            { serial_number: serial }
                        ]
                    },
                    include: [{ model: models.Product, as: 'product' }]
                }
            ]
        });

        if (!warranty) {
            return NextResponse.json({
                success: false,
                message: 'No warranty record found for this Serial/IMEI'
            }, { status: 404 });
        }

        const warrantyData = warranty.toJSON();

        return NextResponse.json({
            success: true,
            data: {
                product: (warranty as any).serialItem.product.name,
                serial_number: (warranty as any).serialItem.serial_number || (warranty as any).serialItem.imei,
                start_date: warrantyData.start_date,
                end_date: warrantyData.end_date,
                status: warrantyData.status,
                isValid: (warranty as any).isValid ? (warranty as any).isValid() : true
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
 
// Force Vercel Refresh
