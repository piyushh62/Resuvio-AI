"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.verifyPayment = exports.createOrder = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const crypto_1 = __importDefault(require("crypto"));
const db = firebase_admin_1.default.firestore();
// Plan prices in paise (Razorpay uses smallest currency unit)
const PLAN_PRICES = {
    hustler: 7900, // ₹79 = 7900 paise
    closer: 17900, // ₹179 = 17900 paise
};
const PLAN_NAMES = {
    hustler: 'Hustler Plan',
    closer: 'Closer Plan',
};
/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the given plan.
 * Body: { plan: 'hustler' | 'closer' }
 */
const createOrder = async (req, res) => {
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
            Razorpay = (await Promise.resolve().then(() => __importStar(require('razorpay')))).default;
        }
        catch {
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
            createdAt: firebase_admin_1.default.firestore.Timestamp.now(),
        });
        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan,
            planName: PLAN_NAMES[plan],
            keyId: process.env.RAZORPAY_KEY_ID || '',
        });
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error creating order:', msg);
        res.status(500).json({ message: 'Failed to create payment order', error: msg });
    }
};
exports.createOrder = createOrder;
/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature and activates the plan.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPayment = async (req, res) => {
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
            }
            else {
                res.status(200).json({ message: 'Payment received (dev mode)' });
            }
            return;
        }
        const expectedSignature = crypto_1.default
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
        const orderData = paymentDoc.data();
        // Update payment record
        await db.collection('payments').doc(razorpay_order_id).update({
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'verified',
            verifiedAt: firebase_admin_1.default.firestore.Timestamp.now(),
        });
        // Activate plan for user
        await activatePlan(userId, orderData.plan);
        res.status(200).json({
            message: 'Payment verified successfully',
            plan: orderData.plan,
        });
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error verifying payment:', msg);
        res.status(500).json({ message: 'Payment verification failed', error: msg });
    }
};
exports.verifyPayment = verifyPayment;
/**
 * GET /api/payments/status
 * Returns the current subscription status for the user.
 */
const getPaymentStatus = async (req, res) => {
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
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[payments]: Error fetching status:', msg);
        res.status(500).json({ message: 'Error fetching payment status', error: msg });
    }
};
exports.getPaymentStatus = getPaymentStatus;
/**
 * Helper: Activate a plan for a user in Firestore.
 */
async function activatePlan(userId, plan) {
    const now = firebase_admin_1.default.firestore.Timestamp.now();
    const expiresAt = firebase_admin_1.default.firestore.Timestamp.fromDate(new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, now.toDate().getDate()));
    await db.collection('users').doc(userId).set({
        plan,
        subscribedAt: now,
        planExpiresAt: expiresAt,
    }, { merge: true });
    console.log(`[payments]: Activated ${plan} plan for user ${userId}`);
}
