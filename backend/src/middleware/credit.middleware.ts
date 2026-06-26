import { Request as ExpressRequest, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { CREDIT_LIMITS } from '../models/credit.model';

interface CustomRequest extends ExpressRequest {
    user?: admin.auth.DecodedIdToken;
    userPlan?: string;
}

const db = admin.firestore();

/**
 * Middleware to check if a user has enough credits for a specific feature.
 * Usage: checkCredits('resumeAnalysis')
 * If credits are exhausted, returns 429 with upgrade prompt.
 */
export const checkCredits = (feature: string) => {
    return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        try {
            const creditRef = db.collection('credits').doc(`${userId}_${feature}`);
            const creditDoc = await creditRef.get();

            let plan = 'seeker'; // default plan

            // Check user's subscription plan (from users collection or default to seeker)
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                plan = userDoc.data()?.plan || 'seeker';
            }

            const limit = CREDIT_LIMITS[plan]?.[feature] ?? 999;

            if (!creditDoc.exists) {
                // First time using this feature — create the record
                const now = admin.firestore.Timestamp.now();
                const resetDate = admin.firestore.Timestamp.fromDate(
                    new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, 1) // 1st of next month
                );

                await creditRef.set({
                    userId,
                    feature,
                    used: 1,
                    limit,
                    plan,
                    resetDate,
                });

                req.userPlan = plan;
                next();
                return;
            }

            const creditData = creditDoc.data()!;

            // Check if credits need to be reset (new billing cycle)
            const now = admin.firestore.Timestamp.now();
            if (creditData.resetDate && now.toMillis() >= creditData.resetDate.toMillis()) {
                // Reset credits for new billing cycle
                const resetDate = admin.firestore.Timestamp.fromDate(
                    new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, 1)
                );
                await creditRef.update({ used: 1, limit, plan, resetDate });
                req.userPlan = plan;
                next();
                return;
            }

            // Check if limit reached
            if (creditData.used >= creditData.limit) {
                res.status(429).json({
                    message: `Monthly limit reached for this feature.`,
                    feature,
                    used: creditData.used,
                    limit: creditData.limit,
                    plan,
                    upgradeUrl: '/pricing',
                });
                return;
            }

            // Increment usage
            await creditRef.update({ used: admin.firestore.FieldValue.increment(1) });
            req.userPlan = plan;
            next();

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('[credits]: Error checking credits:', msg);
            res.status(500).json({ message: 'Error checking credits', error: msg });
        }
    };
};
