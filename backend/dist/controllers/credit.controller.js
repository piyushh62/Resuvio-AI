"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLimits = exports.getUsage = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const credit_model_1 = require("../models/credit.model");
const db = firebase_admin_1.default.firestore();
/**
 * GET /api/credits/usage
 * Returns all credit usage data for the authenticated user.
 */
const getUsage = async (req, res) => {
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
        const usageData = {};
        // Initialize with all features (so frontend always has data)
        const planLimits = credit_model_1.CREDIT_LIMITS[plan] || credit_model_1.CREDIT_LIMITS.seeker;
        for (const [feature, limit] of Object.entries(planLimits)) {
            usageData[feature] = {
                used: 0,
                limit,
                label: credit_model_1.FEATURE_LABELS[feature] || feature,
                remaining: limit,
            };
        }
        // Overlay actual usage data
        snapshot.forEach((doc) => {
            const data = doc.data();
            const feature = data.feature;
            if (usageData[feature]) {
                usageData[feature].used = data.used || 0;
                usageData[feature].remaining = Math.max(0, (usageData[feature].limit - (data.used || 0)));
            }
        });
        res.status(200).json({
            plan,
            usage: usageData,
        });
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[credits]: Error fetching usage:', msg);
        res.status(500).json({ message: 'Error fetching usage data', error: msg });
    }
};
exports.getUsage = getUsage;
/**
 * GET /api/credits/limits
 * Returns the credit limits for all plans (for pricing page display).
 */
const getLimits = async (_req, res) => {
    try {
        const limitsWithLabels = {};
        for (const [plan, features] of Object.entries(credit_model_1.CREDIT_LIMITS)) {
            limitsWithLabels[plan] = {};
            for (const [feature, limit] of Object.entries(features)) {
                limitsWithLabels[plan][feature] = {
                    limit,
                    label: credit_model_1.FEATURE_LABELS[feature] || feature,
                };
            }
        }
        res.status(200).json({ limits: limitsWithLabels });
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[credits]: Error fetching limits:', msg);
        res.status(500).json({ message: 'Error fetching credit limits', error: msg });
    }
};
exports.getLimits = getLimits;
