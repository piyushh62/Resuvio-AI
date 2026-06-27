"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimReferral = exports.getReferralStats = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_config_1 = require("../config/firebase.config");
const referral_model_1 = require("../models/referral.model");
/**
 * GET /api/referrals/stats
 * Returns referral stats for the authenticated user.
 */
const getReferralStats = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Ensure user has a referral code
        const userDoc = await firebase_config_1.db.collection('users').doc(userId).get();
        let referralCode = userDoc.data()?.referralCode;
        if (!referralCode) {
            referralCode = (0, referral_model_1.generateReferralCode)(userId);
            await firebase_config_1.db.collection('users').doc(userId).update({ referralCode });
        }
        // Count referrals
        const referralsSnap = await firebase_config_1.db.collection('referrals')
            .where('referrerUserId', '==', userId)
            .get();
        const referrals = referralsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        const completedCount = referrals.filter((r) => r.status === 'completed' || r.status === 'rewarded').length;
        const pendingCount = referrals.filter((r) => r.status === 'pending').length;
        res.json({
            referralCode,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${referralCode}`,
            stats: {
                total: referrals.length,
                completed: completedCount,
                pending: pendingCount,
                creditsEarned: completedCount * referral_model_1.REFERRAL_REWARD.signupCredits,
            },
            referrals,
        });
    }
    catch (error) {
        console.error('[referral] getReferralStats error:', error);
        res.status(500).json({ message: 'Failed to fetch referral stats' });
    }
};
exports.getReferralStats = getReferralStats;
/**
 * POST /api/referrals/claim
 * Called when a new user signs up with a referral code.
 * Body: { referralCode }
 */
const claimReferral = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { referralCode } = req.body;
        if (!referralCode) {
            res.status(400).json({ message: 'Referral code is required' });
            return;
        }
        // Find the referrer by their code
        const referrerSnap = await firebase_config_1.db.collection('users')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();
        if (referrerSnap.empty) {
            res.status(404).json({ message: 'Invalid referral code' });
            return;
        }
        const referrerDoc = referrerSnap.docs[0];
        const referrerUserId = referrerDoc.id;
        // Don't allow self-referral
        if (referrerUserId === userId) {
            res.status(400).json({ message: 'You cannot refer yourself' });
            return;
        }
        // Check if this referral already exists
        const existingSnap = await firebase_config_1.db.collection('referrals')
            .where('referrerUserId', '==', referrerUserId)
            .where('referredUserId', '==', userId)
            .limit(1)
            .get();
        if (!existingSnap.empty) {
            res.status(409).json({ message: 'Referral already claimed' });
            return;
        }
        // Create the referral record
        const referralRef = firebase_config_1.db.collection('referrals').doc();
        await referralRef.set({
            referrerUserId,
            referredUserId: userId,
            referralCode,
            status: 'completed',
            creditsAwarded: true,
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            completedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
        // Award credits to both users
        await awardCredits(referrerUserId, referral_model_1.REFERRAL_REWARD.signupCredits);
        await awardCredits(userId, referral_model_1.REFERRAL_REWARD.signupCredits);
        res.json({
            message: 'Referral claimed successfully!',
            creditsAwarded: referral_model_1.REFERRAL_REWARD.signupCredits,
        });
    }
    catch (error) {
        console.error('[referral] claimReferral error:', error);
        res.status(500).json({ message: 'Failed to process referral' });
    }
};
exports.claimReferral = claimReferral;
/**
 * Helper: Add credits to a user's credit pool for a specific feature.
 * This creates or increments the credits document.
 */
async function awardCredits(userId, amount) {
    const creditRef = firebase_config_1.db.collection('credits').doc(userId);
    const creditDoc = await creditRef.get();
    if (creditDoc.exists) {
        const data = creditDoc.data() || {};
        const referralBonus = (data.referralBonus || 0) + amount;
        await creditRef.update({ referralBonus, updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() });
    }
    else {
        await creditRef.set({
            userId,
            referralBonus: amount,
            plan: 'seeker',
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
    }
}
