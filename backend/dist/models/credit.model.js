"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_LABELS = exports.CREDIT_LIMITS = void 0;
// Default credit limits per plan per feature
exports.CREDIT_LIMITS = {
    seeker: {
        resumeAnalysis: 3,
        jobMatch: 3,
        coverLetter: 2,
        aiAssist: 5,
        pdfDownload: 3,
    },
    hustler: {
        resumeAnalysis: 999, // "Unlimited" represented as high number
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
exports.FEATURE_LABELS = {
    resumeAnalysis: 'Resume Analysis',
    jobMatch: 'Job Match',
    coverLetter: 'Cover Letter',
    aiAssist: 'AI Assist',
    pdfDownload: 'PDF Downloads',
};
