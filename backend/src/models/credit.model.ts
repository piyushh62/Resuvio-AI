import admin from 'firebase-admin';

export interface CreditUsage {
    userId: string;
    feature: string;           // e.g., 'resumeAnalysis', 'coverLetter', 'jobMatch', 'aiAssist', 'pdfDownload'
    used: number;              // How many times used this cycle
    limit: number;             // Monthly limit based on plan
    resetDate: admin.firestore.Timestamp; // When credits reset
    plan: 'seeker' | 'hustler' | 'closer'; // Current plan
}

// Default credit limits per plan per feature
export const CREDIT_LIMITS: Record<string, Record<string, number>> = {
    seeker: {
        resumeAnalysis: 3,
        jobMatch: 3,
        coverLetter: 2,
        aiAssist: 5,
        pdfDownload: 3,
    },
    hustler: {
        resumeAnalysis: 999,  // "Unlimited" represented as high number
        jobMatch: 20,
        coverLetter: 10,
        aiAssist: 50,
        pdfDownload: 999,
    },
    closer: {
        resumeAnalysis: 999,
        jobMatch: 999,
        coverLetter: 999,
        aiAssist: 999,
        pdfDownload: 999,
    },
};

// Human-readable feature names
export const FEATURE_LABELS: Record<string, string> = {
    resumeAnalysis: 'Resume Analysis',
    jobMatch: 'Job Match',
    coverLetter: 'Cover Letter',
    aiAssist: 'AI Assist',
    pdfDownload: 'PDF Downloads',
};
