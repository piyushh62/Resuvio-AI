import { Request as ExpressRequest, Response } from 'express';
import admin from 'firebase-admin';
import { CREDIT_LIMITS, FEATURE_LABELS } from '../models/credit.model';

interface CustomRequest extends ExpressRequest {
    user?: admin.auth.DecodedIdToken;
}

const db = admin.firestore();

/**
 * GET /api/credits/usage
 * Returns all credit usage data for the authenticated user.
 */
export const getUsage = async (req: CustomRequest, res: Response): Promise<void> => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        // Get user's plan
        let plan = 'seeker';
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            plan = userDoc.data()?.plan || 'seeker';
        }

        // Get all credit records for this user
        const snapshot = await db.collection('credits')
            .where('userId', '==', userId)
            .get();

        const usageData: Record<string, { used: number; limit: number; label: string; remaining: number }> = {};

        // Initialize with all features (so frontend always has data)
        const planLimits = CREDIT_LIMITS[plan] || CREDIT_LIMITS.seeker;
        for (const [feature, limit] of Object.entries(planLimits)) {
            usageData[feature] = {
                used: 0,
                limit,
                label: FEATURE_LABELS[feature] || feature,
                remaining: limit,
            };
        }

        // Overlay actual usage data
        snapshot.forEach((doc) => {
            const data = doc.data();
            const feature = data.feature as string;
            if (usageData[feature]) {
                usageData[feature].used = data.used || 0;
                usageData[feature].remaining = Math.max(0, (usageData[feature].limit - (data.used || 0)));
            }
        });

        res.status(200).json({
            plan,
            usage: usageData,
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[credits]: Error fetching usage:', msg);
        res.status(500).json({ message: 'Error fetching usage data', error: msg });
    }
};

/**
 * GET /api/credits/limits
 * Returns the credit limits for all plans (for pricing page display).
 */
export const getLimits = async (_req: ExpressRequest, res: Response): Promise<void> => {
    try {
        const limitsWithLabels: Record<string, Record<string, { limit: number; label: string }>> = {};

        for (const [plan, features] of Object.entries(CREDIT_LIMITS)) {
            limitsWithLabels[plan] = {};
            for (const [feature, limit] of Object.entries(features)) {
                limitsWithLabels[plan][feature] = {
                    limit,
                    label: FEATURE_LABELS[feature] || feature,
                };
            }
        }

        res.status(200).json({ limits: limitsWithLabels });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[credits]: Error fetching limits:', msg);
        res.status(500).json({ message: 'Error fetching credit limits', error: msg });
    }
};
