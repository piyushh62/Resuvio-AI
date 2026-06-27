import admin from 'firebase-admin';

export interface CoverLetter {
    userId: string;
    resumeId: string;
    jobRole: string;
    companyName: string;
    content: string;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}
