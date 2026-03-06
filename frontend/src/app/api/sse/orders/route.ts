import { NextRequest } from 'next/server';
import { models } from '@/lib/db';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SSE endpoint: /api/sse/orders
 * Streams real-time order updates to the client every 3 seconds.
 * Clients connect once and receive a stream of JSON events.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending,preparing,ready';

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let running = true;

            // Send a heartbeat comment every 20s to keep connection alive
            const heartbeat = setInterval(() => {
                if (!running) return;
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch { }
            }, 20000);

            const sendOrders = async () => {
                if (!running) return;
                try {
                    const statuses = status.split(',').map(s => s.trim());
                    const where: any = {};
                    if (statuses.length > 1) {
                        where.status = { [Op.in]: statuses };
                    } else {
                        where.status = status;
                    }

                    const orders = await models.CafeOrder.findAll({
                        where,
                        include: [
                            {
                                model: models.CafeOrderItem,
                                as: 'items',
                                include: [{
                                    model: models.MenuItem,
                                    as: 'menuItem',
                                    attributes: ['id', 'name', 'name_kh']
                                }]
                            }
                        ],
                        order: [['created_at', 'DESC']],
                        limit: 50
                    });

                    const payload = JSON.stringify({
                        type: 'orders',
                        data: orders,
                        timestamp: new Date().toISOString()
                    });

                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                } catch (err) {
                    console.error('[SSE] Error fetching orders:', err);
                }

                if (running) {
                    setTimeout(sendOrders, 3000);
                }
            };

            // Send initial data immediately
            await sendOrders();

            // Clean up when client disconnects
            request.signal.addEventListener('abort', () => {
                running = false;
                clearInterval(heartbeat);
                try { controller.close(); } catch { }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        }
    });
}
