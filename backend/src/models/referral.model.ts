/**
 * Referral Model
 * "Give 2, Get 2" — both referrer and referred earn credits on signup + first purchase.
 */

export interface ReferralRecord {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  creditsAwarded: boolean;
  createdAt: Date;
  completedAt?: Date;
}

/** How many credits each side gets */
export const REFERRAL_REWARD = {
  signupCredits: 2,   // Both sides get 2 credits on referred user signup
  purchaseCredits: 2, // Both sides get 2 more credits on referred user's first purchase
};

/** Generate a short unique referral code from a user ID */
export function generateReferralCode(userId: string): string {
  const hash = userId.slice(0, 6).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CF-${hash}${random}`;
}
