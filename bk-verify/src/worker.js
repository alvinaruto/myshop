/**
 * Bakong API Proxy - Cloudflare Worker
 * Proxies KHQR payment verification requests to the Bakong API
 * to avoid CloudFront WAF blocking from Vercel/AWS.
 */

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '*';

        // Standard CORS headers for all responses
        const corsHeaders = {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true',
        };

        // Helper to return JSON with CORS
        const jsonResponse = (data, status = 200) => {
            return new Response(JSON.stringify(data), {
                status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        try {
            const body = await request.json().catch(() => ({}));
            const { md5, externalRef } = body;

            if (!md5 && !externalRef) {
                return jsonResponse({ success: false, message: 'MD5 or externalRef required' }, 400);
            }

            // Determine which Bakong endpoint to call
            let endpoint, payload;
            if (externalRef) {
                endpoint = '/check_transaction_by_external_ref';
                payload = { externalRef };
            } else {
                endpoint = '/check_transaction_by_md5';
                payload = { md5 };
            }

            const bakongUrl = `${env.BAKONG_API_URL}${endpoint}`;
            const token = env.BAKONG_TOKEN || '';

            console.log(`[Bakong Proxy] Calling ${bakongUrl} for ${endpoint === '/check_transaction_by_external_ref' ? 'ExternalRef: ' + externalRef : 'MD5: ' + md5}`);

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const bakongResponse = await fetch(bakongUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            const responseText = await bakongResponse.text();
            console.log(`[Bakong Proxy] Status: ${bakongResponse.status}`);

            if (!bakongResponse.ok) {
                return jsonResponse({
                    success: false,
                    message: `Bakong API returned HTTP ${bakongResponse.status}`,
                    raw: responseText.substring(0, 100)
                }, 502);
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                return jsonResponse({ success: false, message: 'Invalid JSON response from Bakong' }, 502);
            }

            // Support both string "0" and number 0 as success
            const isSuccess = data.responseCode === 0 || data.responseCode === '0' || data.responseCode === '000';

            if (isSuccess) {
                return jsonResponse({ success: true, message: 'Payment verified', data: data.data || data });
            } else {
                return jsonResponse({
                    success: false,
                    message: data.responseMessage || 'Payment not found',
                    code: data.responseCode,
                });
            }
        } catch (error) {
            console.error('[Bakong Proxy] Error:', error.message);
            return jsonResponse({ success: false, message: error.message }, 500);
        }
    },
};
