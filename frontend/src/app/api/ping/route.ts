import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json({ 
        success: true, 
        message: 'Ping from Next.js',
        url: req.url,
        headers: Object.fromEntries(req.headers.entries())
    });
}
