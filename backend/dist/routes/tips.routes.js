"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import controller
const tips_controller_1 = require("../controllers/tips.controller");
// Import middleware if authentication is needed later
// import { authenticateToken } from '../middleware/auth.middleware';
const router = (0, express_1.Router)();
// GET /api/tips - Fetch general resume tips
router.get('/', 
// authenticateToken, // Add this later if tips become personalized
tips_controller_1.getTips);
exports.default = router;
