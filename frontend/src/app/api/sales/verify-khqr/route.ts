import { NextRequest, NextResponse } from 'next/server';

const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_TOKEN = process.env.BAKONG_TOKEN || '';

async function checkTransaction(type: string, value: string) {
    const payload: Record<string, string> = {};
    payload[type === 'externalRef' ? 'externalRef' : type] = value;

    const endpointMap: Record<string, string> = {
        'md5': '/check_transaction_by_md5',
        'externalRef': '/check_transaction_by_external_ref',
        'hash': '/check_transaction_by_hash'
    };

    const endpoint = endpointMap[type];
    const url = `${BAKONG_API_URL}${endpoint}`;

    console.log(`[KHQR Verify] Calling ${url} with type=${type}`);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (BAKONG_TOKEN) {
        headers['Authorization'] = `Bearer ${BAKONG_TOKEN}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`[KHQR Verify] HTTP ${response.status}: ${text.substring(0, 200)}`);
        throw new Error(`Bakong API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[KHQR Verify] Response:`, JSON.stringify(data));

    if (data && (data.responseCode === 0 || data.responseCode === '0')) {
        return {
            success: true,
            data: data.data || data
        };
    } else {
        return {
            success: false,
            message: data.responseMessage || 'Transaction check failed',
            code: data.responseCode,
            errorCode: data.errorCode
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const { md5, externalRef } = await req.json();

        if (!md5 && !externalRef) {
            return NextResponse.json(
                { success: false, message: 'MD5 hash or External Reference is required' },
                { status: 400 }
            );
        }

        let result;
        if (externalRef) {
            result = await checkTransaction('externalRef', externalRef);
        } else {
            result = await checkTransaction('md5', md5);
        }

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                data: result.data
            });
        } else {
            return NextResponse.json({
                success: false,
                message: result.message || 'Payment not found or failed',
                code: result.code
            });
        }
    } catch (error: any) {
        console.error('[KHQR Verify] Error:', error.message);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
