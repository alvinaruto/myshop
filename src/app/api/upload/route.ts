import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) return unauthorizedResponse();

        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Check for Cloudinary configuration
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            const missing = [];
            if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
            if (!apiKey) missing.push('CLOUDINARY_API_KEY');
            if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

            console.error('Missing Cloudinary env vars:', missing.join(', '));
            return NextResponse.json({
                success: false,
                message: `Image upload requires Cloudinary. Missing env vars: ${missing.join(', ')}. Please add these to your Vercel project settings.`
            }, { status: 501 });
        }

        // Convert File to Buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary streamingly
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'myshop-products',
                format: 'webp',
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        }) as any;

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: uploadResult.secure_url,
                filename: uploadResult.public_id,
                is_cloud: true
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
