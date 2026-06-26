import { Request as ExpressRequest, Response } from 'express';
import admin from 'firebase-admin';
import crypto from 'crypto';

interface CustomRequest extends ExpressRequest {
    user?: admin.auth.DecodedIdToken;
}

const db = admin.firestore();

// Plan prices in paise (Razorpay uses smallest currency unit)
const PLAN_PRICES: Record<string, number> = {
    hustler: 7900,   // ₹79 = 7900 paise
    closer: 17900,   // ₹179 = 17900 paise
};

const PLAN_NAMES: Record<string, string> = {
    hustler: 'Hustler Plan',
    closer: 'Closer Plan',
};

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the given plan.
 * Body: { plan: 'hustler' | 'closer' }
 */
export const createOrder = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { plan } = req.body;

    if (!plan || !PLAN_PRICES[plan]) {
        res.status(400).json({ message: 'Invalid plan. Choose from: hustler, closer' });
        return;
    }

    try {
        // Dynamically import Razorpay (to avoid crash if not installed)
        let Razorpay;
        try {
            Razorpay = (await import('razorpay')).default;
        } catch {
            // Razorpay not installed — return mock order for development
            console.log('[payments]: Razorpay not installed. Returning mock order.');
            const mockOrderId = `order_mock_${Date.now()}`;
            res.status(200).json({
                orderId: mockOrderId,
                amount: PLAN_PRICES[plan],
                currency: 'INR',
                plan,
                planName: PLAN_NAMES[plan],
                mock: true,
            });
            return;
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            amount: PLAN_PRICES[plan],
            currency: 'INR',
            receipt: `receipt_${userId}_${plan}_${Date.now()}`,
            notes: {
                userId,
                plan,
            },
        };

        const order = await razorpay.orders.create(options);

        // Store pending order in Firestore
        await db.collection('payments').doc(order.id).set({
            userId,
            plan,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: 'created',
            createdAt: admin.firestore.Timestamp.now(),
        });

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan,
            planName: PLAN_NAMES[plan],
            keyId: process.env.RAZORPAY_KEY_ID || '',
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error creating order:', msg);
        res.status(500).json({ message: 'Failed to create payment order', error: msg });
    }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature and activates the plan.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ message: 'Missing payment verification fields' });
        return;
    }

    try {
        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        if (!secret) {
            console.log('[payments]: RAZORPAY_KEY_SECRET not set. Skipping verification (dev mode).');
            // In dev mode, trust the payment and activate plan
            const paymentDoc = await db.collection('payments').doc(razorpay_order_id).get();
            if (paymentDoc.exists) {
                const plan = paymentDoc.data()?.plan;
                await activatePlan(userId, plan);
                res.status(200).json({ message: 'Payment verified (dev mode)', plan });
            } else {
                res.status(200).json({ message: 'Payment received (dev mode)' });
            }
            return;
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            res.status(400).json({ message: 'Payment verification failed: invalid signature' });
            return;
        }

        // Get order details
        const paymentDoc = await db.collection('payments').doc(razorpay_order_id).get();
        if (!paymentDoc.exists) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const orderData = paymentDoc.data()!;

        // Update payment record
        await db.collection('payments').doc(razorpay_order_id).update({
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'verified',
            verifiedAt: admin.firestore.Timestamp.now(),
        });

        // Activate plan for user
        await activatePlan(userId, orderData.plan);

        res.status(200).json({
            message: 'Payment verified successfully',
            plan: orderData.plan,
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error verifying payment:', msg);
        res.status(500).json({ message: 'Payment verification failed', error: msg });
    }
};

/**
 * GET /api/payments/status
 * Returns the current subscription status for the user.
 */
export const getPaymentStatus = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        res.status(200).json({
            plan: userData?.plan || 'seeker',
            planName: PLAN_NAMES[userData?.plan] || 'Seeker (Free)',
            subscribedAt: userData?.subscribedAt || null,
            expiresAt: userData?.planExpiresAt || null,
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error fetching status:', msg);
        res.status(500).json({ message: 'Error fetching payment status', error: msg });
    }
};

/**
 * Helper: Activate a plan for a user in Firestore.
 */
async function activatePlan(userId: string, plan: string): Promise<void> {
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, now.toDate().getDate())
    );

    await db.collection('users').doc(userId).set({
        plan,
        subscribedAt: now,
        planExpiresAt: expiresAt,
    }, { merge: true });

    console.log(`[payments]: Activated ${plan} plan for user ${userId}`);
}
