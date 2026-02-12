import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

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
                message: `Image upload requires Cloudinary. Missing: ${missing.join(', ')}`
            }, { status: 501 });
        }

        // Configure Cloudinary at request time (important for serverless)
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });

        // Convert File to Buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Check file size (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            }, { status: 400 });
        }

        // Convert buffer to base64 data URI for upload
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${base64}`;

        // Upload to Cloudinary using base64
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'myshop-products',
            format: 'webp',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

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
        console.error('Upload error:', error);

        // Provide more specific error messages
        let message = 'Upload failed';
        if (error.message?.includes('Invalid')) {
            message = 'Invalid Cloudinary credentials. Please check your API keys.';
        } else if (error.message?.includes('network')) {
            message = 'Network error connecting to Cloudinary.';
        } else if (error.message) {
            message = error.message;
        }

        return NextResponse.json({
            success: false,
            message,
            details: error.http_code ? `Cloudinary error ${error.http_code}` : undefined
        }, { status: 500 });
    }
}
