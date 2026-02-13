/**
 * Local Bakong Proxy Server
 * Run this on your local machine in Cambodia to bypass Bakong API blocks.
 * Usage: node local-proxy.js
 */

const http = require('http');
const https = require('https');

// SET YOUR BAKONG TOKEN HERE
const BAKONG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMDZmZTRiNDgyMzRhNDYxNCJ9LCJpYXQiOjE3NzA5MTQyNzAsImV4cCI6MTc3ODY5MDI3MH0.HFtmrs8c9x9F-4GDeQK1us5Lqhhc95MT1Rup2kka9IA';
const PORT = 5005;

const server = http.createServer((req, res) => {
    // CORS Headers
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24h

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // Add a root GET handler just to test easily
    if (req.method === 'GET' && req.url === '/') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Bakong Local Proxy is Running!');
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`[Proxy] Received request: ${body}`);

            let payload;
            try {
                payload = JSON.parse(body);
            } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            const { md5, externalRef } = payload;

            const performBakongRequest = (endpoint, bakongPayload) => {
                return new Promise((resolve, reject) => {
                    const options = {
                        hostname: 'api-bakong.nbc.gov.kh',
                        path: endpoint,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${BAKONG_TOKEN}`,
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    };

                    const bakongReq = https.request(options, (bakongRes) => {
                        let bakongData = '';
                        bakongRes.on('data', (d) => bakongData += d);
                        bakongRes.on('end', () => {
                            try {
                                const parsedData = JSON.parse(bakongData);
                                resolve({ statusCode: bakongRes.statusCode, data: parsedData });
                            } catch (e) {
                                resolve({ statusCode: bakongRes.statusCode, data: { responseMessage: 'Invalid JSON', raw: bakongData } });
                            }
                        });
                    });

                    bakongReq.on('error', reject);
                    bakongReq.write(JSON.stringify(bakongPayload));
                    bakongReq.end();
                });
            };

            const runCheck = async () => {
                // 1. Try MD5 first (Most reliable for KHQR)
                console.log(`[Proxy] Attempting MD5 lookup: ${md5}`);
                let result = await performBakongRequest('/v1/check_transaction_by_md5', { md5 });

                let isSuccess = result.data.responseCode === '000' || result.data.responseCode === '0' || result.data.responseCode === 0;

                // 2. Fallback to ExternalRef if MD5 fails
                if (!isSuccess && externalRef) {
                    console.log(`[Proxy] MD5 not found. Attempting ExternalRef lookup: ${externalRef}`);
                    result = await performBakongRequest('/v1/check_transaction_by_external_ref', { externalRef });
                    isSuccess = result.data.responseCode === '000' || result.data.responseCode === '0' || result.data.responseCode === 0;
                }

                const normalizedResponse = {
                    success: isSuccess,
                    ...result.data
                };

                console.log(`[Proxy] Final Result -> Success: ${isSuccess}, Code: ${result.data.responseCode}`);

                res.statusCode = result.statusCode;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(normalizedResponse));
            };

            runCheck().catch(err => {
                console.error(`[Proxy] Critical Error: ${err.message}`);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
            });
        });
    } else {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Local Bakong Proxy running at http://localhost:${PORT}`);
    console.log(`------------------------------------------------------`);
    console.log(`1. Ensure you have pasted your BAKONG_TOKEN in this script.`);
    console.log(`2. If you are testing the Vercel-deployed app, you MUST use ngrok:`);
    console.log(`   ngrok http ${PORT}`);
    console.log(`3. Then paste the ngrok URL into the store's settings or KHQR.tsx.`);
});
