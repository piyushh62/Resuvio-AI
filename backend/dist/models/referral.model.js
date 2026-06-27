"use strict";
/**
 * Referral Model
 * "Give 2, Get 2" — both referrer and referred earn credits on signup + first purchase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFERRAL_REWARD = void 0;
exports.generateReferralCode = generateReferralCode;
/** How many credits each side gets */
exports.REFERRAL_REWARD = {
    signupCredits: 2, // Both sides get 2 credits on referred user signup
    purchaseCredits: 2, // Both sides get 2 more credits on referred user's first purchase
};
/** Generate a short unique referral code from a user ID */
function generateReferralCode(userId) {
    const hash = userId.slice(0, 6).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CF-${hash}${random}`;
}
