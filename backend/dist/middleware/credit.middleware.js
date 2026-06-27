"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredits = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const credit_model_1 = require("../models/credit.model");
const db = firebase_admin_1.default.firestore();
/**
 * Middleware to check if a user has enough credits for a specific feature.
 * Usage: checkCredits('resumeAnalysis')
 * If credits are exhausted, returns 429 with upgrade prompt.
 */
const checkCredits = (feature) => {
    return async (req, res, next) => {
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
            const limit = credit_model_1.CREDIT_LIMITS[plan]?.[feature] ?? 999;
            if (!creditDoc.exists) {
                // First time using this feature — create the record
                const now = firebase_admin_1.default.firestore.Timestamp.now();
                const resetDate = firebase_admin_1.default.firestore.Timestamp.fromDate(new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, 1) // 1st of next month
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
            const creditData = creditDoc.data();
            // Check if credits need to be reset (new billing cycle)
            const now = firebase_admin_1.default.firestore.Timestamp.now();
            if (creditData.resetDate && now.toMillis() >= creditData.resetDate.toMillis()) {
                // Reset credits for new billing cycle
                const resetDate = firebase_admin_1.default.firestore.Timestamp.fromDate(new Date(now.toDate().getFullYear(), now.toDate().getMonth() + 1, 1));
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
            await creditRef.update({ used: firebase_admin_1.default.firestore.FieldValue.increment(1) });
            req.userPlan = plan;
            next();
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('[credits]: Error checking credits:', msg);
            res.status(500).json({ message: 'Error checking credits', error: msg });
        }
    };
};
exports.checkCredits = checkCredits;
