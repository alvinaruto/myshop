import { models } from './db';

/**
 * Sends a push notification to a customer using their FCM token.
 * For now, this is a placeholder that will use the FCM HTTP v1 API 
 * once a service account is configured.
 * 
 * In a real production environment, you would use firebase-admin.
 */
export async function sendFcmNotification(phone: string, title: string, body: string, data: any = {}) {
    try {
        const customer = await models.CafeCustomer.findOne({
            where: { phone }
        });

        const fcmToken = (customer as any)?.fcm_token;
        if (!fcmToken) {
            console.log(`[FCM] No token found for customer ${phone}`);
            return false;
        }

        console.log(`[FCM] Sending notification to ${phone}: ${title} - ${body}`);

        // TODO: Implement actual FCM sending logic here. 
        // This requires firebase-admin and a service account JSON file.
        // For now, we log it to the console.

        /*
        const message = {
            notification: { title, body },
            data: { ...data, title, body },
            token: fcmToken
        };
        
        await admin.messaging().send(message);
        */

        return true;
    } catch (error) {
        console.error('[FCM] Error sending notification:', error);
        return false;
    }
}

/**
 * Broadcast notification to all customers (optional use cases)
 */
export async function broadcastFcmNotification(title: string, body: string, data: any = {}) {
    // Implementation for broadcasting to all tokens or a topic
}
