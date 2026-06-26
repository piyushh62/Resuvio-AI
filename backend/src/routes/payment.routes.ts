import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createOrder, verifyPayment, getPaymentStatus } from '../controllers/payment.controller';

const router = Router();

// POST /api/payments/create-order - Create Razorpay order (authenticated)
router.post('/create-order', authenticateToken, createOrder);

// POST /api/payments/verify - Verify payment signature (authenticated)
router.post('/verify', authenticateToken, verifyPayment);

// GET /api/payments/status - Get current subscription status (authenticated)
router.get('/status', authenticateToken, getPaymentStatus);

export default router;
