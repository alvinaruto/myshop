import { models } from './db';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
        try {
            const serviceAccount = JSON.parse(serviceAccountStr);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('[FCM] Firebase Admin initialized');
        } catch (e) {
            console.error('[FCM] Failed to parse service account JSON:', e);
        }
    } else {
        console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT not found in environment');
    }
}

/**
 * Sends a push notification to a customer using their FCM token.
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

        console.log(`[FCM] Sending notification to ${phone}: ${title}`);

        if (admin.apps.length > 0) {
            const message = {
                notification: { title, body },
                data: { ...data, title, body },
                token: fcmToken
            };
            await admin.messaging().send(message);
            return true;
        } else {
            console.warn('[FCM] Firebase not initialized, skipping send');
            return false;
        }
    } catch (error) {
        console.error('[FCM] Error sending notification:', error);
        return false;
    }
}

/**
 * Broadcast notification to a specific FCM topic (e.g. 'all_staff' or 'new_orders')
 */
export async function sendFcmToTopic(topic: string, title: string, body: string, data: any = {}) {
    try {
        console.log(`[FCM-Topic] Sending to ${topic}: ${title}`);

        if (admin.apps.length > 0) {
            await admin.messaging().send({
                topic,
                notification: { title, body },
                data: { ...data, title, body }
            });
            return true;
        }
        return false;
    } catch (e) {
        console.error('[FCM-Topic] Error:', e);
        return false;
    }
}

/**
 * Sends a notification to all active staff members.
 */
export async function notifyAllStaff(title: string, body: string, data: any = {}) {
    try {
        const staff = await (models as any).User.findAll({
            where: { is_active: true }
        });

        const tokens: string[] = staff
            .map((u: any) => u.fcm_token)
            .filter((t: string) => !!t);

        console.log(`[FCM-Staff] Sending to ${tokens.length} tokens for title: ${title}`);

        if (admin.apps.length > 0 && tokens.length > 0) {
            // We use a simple loop or sendEach if supported
            for (const token of tokens) {
                admin.messaging().send({
                    token,
                    notification: { title, body },
                    data: { ...data, title, body }
                }).catch(e => console.error('[FCM-Staff] Error sending to token:', e));
            }
        }

        // Also send to topic for convenience (if devices are subscribed)
        await sendFcmToTopic('new-order', title, body, data);

        return true;
    } catch (e) {
        console.error('[FCM-Staff] Error:', e);
        return false;
    }
}
