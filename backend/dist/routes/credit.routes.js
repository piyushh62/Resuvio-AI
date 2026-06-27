"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const credit_controller_1 = require("../controllers/credit.controller");
const router = (0, express_1.Router)();
// GET /api/credits/usage - Get current user's usage (authenticated)
router.get('/usage', auth_middleware_1.authenticateToken, credit_controller_1.getUsage);
// GET /api/credits/limits - Get credit limits for all plans (public)
router.get('/limits', credit_controller_1.getLimits);
exports.default = router;
