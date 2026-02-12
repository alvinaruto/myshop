import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin' && auth.role !== 'manager') {
            return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });
        }

        const brand = await models.Brand.findByPk(params.id);
        if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });

        const data = await req.json();
        await brand.update(data);

        return NextResponse.json({ success: true, data: brand });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        if (auth.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Only admins can delete brands' }, { status: 403 });
        }

        const brand = await models.Brand.findByPk(params.id);
        if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });

        await brand.destroy();
        return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
