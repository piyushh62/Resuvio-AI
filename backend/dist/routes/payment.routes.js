"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// POST /api/payments/create-order - Create Razorpay order (authenticated)
router.post('/create-order', auth_middleware_1.authenticateToken, payment_controller_1.createOrder);
// POST /api/payments/verify - Verify payment signature (authenticated)
router.post('/verify', auth_middleware_1.authenticateToken, payment_controller_1.verifyPayment);
// GET /api/payments/status - Get current subscription status (authenticated)
router.get('/status', auth_middleware_1.authenticateToken, payment_controller_1.getPaymentStatus);
exports.default = router;
