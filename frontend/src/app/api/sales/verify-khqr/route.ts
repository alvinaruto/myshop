import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_EMAIL = process.env.BAKONG_EMAIL;
let cachedToken = process.env.BAKONG_TOKEN || null;

const bakongApi = axios.create({
    baseURL: BAKONG_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

async function renewToken() {
    if (!BAKONG_EMAIL) {
        console.warn('BAKONG_EMAIL not set, cannot renew token');
        return null;
    }

    try {
        console.log('Renewing Bakong token for:', BAKONG_EMAIL);
        const response = await axios.post(`${BAKONG_API_URL}/renew_token`, {
            email: BAKONG_EMAIL
        });

        if (response.data && (response.data.responseCode === 0 || response.data.responseCode === '0')) {
            cachedToken = response.data.data.token;
            console.log('Bakong token renewed successfully');
            return cachedToken;
        }
        throw new Error(response.data.responseMessage || 'Failed to renew token');
    } catch (error: any) {
        console.error('Bakong Token Renewal Error:', error.response?.data || error.message);
        return null;
    }
}

async function checkTransaction(type: string, value: string) {
    const performRequest = async (token: string | null) => {
        const payload: any = {};
        payload[type === 'externalRef' ? 'externalRef' : type] = value;

        const endpointMap: Record<string, string> = {
            'md5': '/check_transaction_by_md5',
            'externalRef': '/check_transaction_by_external_ref',
            'hash': '/check_transaction_by_hash'
        };

        const endpoint = endpointMap[type];

        return await bakongApi.post(endpoint, payload, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
    };

    try {
        let response = await performRequest(cachedToken);

        // If unauthorized and we have email, try to renew token and retry once
        if (response.data && response.data.responseCode === 1 && response.data.errorCode === 401 && BAKONG_EMAIL) {
            const newToken = await renewToken();
            if (newToken) {
                response = await performRequest(newToken);
            }
        }

        if (response.data && (response.data.responseCode === 0 || response.data.responseCode === '0')) {
            return {
                success: true,
                data: response.data.data || response.data
            };
        } else {
            return {
                success: false,
                message: response.data.responseMessage || 'Transaction check failed',
                code: response.data.responseCode,
                errorCode: response.data.errorCode
            };
        }

    } catch (error: any) {
        console.error('Bakong API Error:', error.response?.data || error.message);
        throw new Error('Failed to check transaction status with Bakong');
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
        console.error('Verify KHQR Error:', error.message);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
