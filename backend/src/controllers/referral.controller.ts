import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase.config';
import { generateReferralCode, REFERRAL_REWARD } from '../models/referral.model';

interface CustomRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * GET /api/referrals/stats
 * Returns referral stats for the authenticated user.
 */
export const getReferralStats = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Ensure user has a referral code
    const userDoc = await db.collection('users').doc(userId).get();
    let referralCode = userDoc.data()?.referralCode as string | undefined;

    if (!referralCode) {
      referralCode = generateReferralCode(userId);
      await db.collection('users').doc(userId).update({ referralCode });
    }

    // Count referrals
    const referralsSnap = await db.collection('referrals')
      .where('referrerUserId', '==', userId)
      .get();

    const referrals = referralsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const completedCount = referrals.filter((r: any) => r.status === 'completed' || r.status === 'rewarded').length;
    const pendingCount = referrals.filter((r: any) => r.status === 'pending').length;

    res.json({
      referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${referralCode}`,
      stats: {
        total: referrals.length,
        completed: completedCount,
        pending: pendingCount,
        creditsEarned: completedCount * REFERRAL_REWARD.signupCredits,
      },
      referrals,
    });
  } catch (error) {
    console.error('[referral] getReferralStats error:', error);
    res.status(500).json({ message: 'Failed to fetch referral stats' });
  }
};

/**
 * POST /api/referrals/claim
 * Called when a new user signs up with a referral code.
 * Body: { referralCode }
 */
export const claimReferral = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const referrerSnap = await db.collection('users')
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
    const existingSnap = await db.collection('referrals')
      .where('referrerUserId', '==', referrerUserId)
      .where('referredUserId', '==', userId)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      res.status(409).json({ message: 'Referral already claimed' });
      return;
    }

    // Create the referral record
    const referralRef = db.collection('referrals').doc();
    await referralRef.set({
      referrerUserId,
      referredUserId: userId,
      referralCode,
      status: 'completed',
      creditsAwarded: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Award credits to both users
    await awardCredits(referrerUserId, REFERRAL_REWARD.signupCredits);
    await awardCredits(userId, REFERRAL_REWARD.signupCredits);

    res.json({
      message: 'Referral claimed successfully!',
      creditsAwarded: REFERRAL_REWARD.signupCredits,
    });
  } catch (error) {
    console.error('[referral] claimReferral error:', error);
    res.status(500).json({ message: 'Failed to process referral' });
  }
};

/**
 * Helper: Add credits to a user's credit pool for a specific feature.
 * This creates or increments the credits document.
 */
async function awardCredits(userId: string, amount: number): Promise<void> {
  const creditRef = db.collection('credits').doc(userId);
  const creditDoc = await creditRef.get();

  if (creditDoc.exists) {
    const data = creditDoc.data() || {};
    const referralBonus = (data.referralBonus || 0) + amount;
    await creditRef.update({ referralBonus, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  } else {
    await creditRef.set({
      userId,
      referralBonus: amount,
      plan: 'seeker',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
