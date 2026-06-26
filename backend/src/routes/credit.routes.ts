import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getUsage, getLimits } from '../controllers/credit.controller';

const router = Router();

// GET /api/credits/usage - Get current user's usage (authenticated)
router.get('/usage', authenticateToken, getUsage);

// GET /api/credits/limits - Get credit limits for all plans (public)
router.get('/limits', getLimits);

export default router;
