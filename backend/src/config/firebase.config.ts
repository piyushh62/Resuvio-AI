import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded
dotenv.config();

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
    console.log('[firebase-config]: Attempting Firebase Admin SDK initialization...');
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    let credential: admin.credential.Credential;

    if (serviceAccountBase64) {
        const decodedServiceAccount = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        credential = admin.credential.cert(JSON.parse(decodedServiceAccount));
    } else if (serviceAccountJson) {
        credential = admin.credential.cert(JSON.parse(serviceAccountJson));
    } else if (serviceAccountPath) {
        // Resolve absolute path in case relative path is provided
        const resolvedPath = path.resolve(serviceAccountPath);
        credential = admin.credential.cert(resolvedPath);
    } else {
        throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_SERVICE_ACCOUNT_BASE64.');
    }

    // Check if already initialized (useful for hot-reloading environments)
    if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp({
            credential
        });
        console.log('[firebase-config]: Firebase Admin SDK initialized successfully.');
    } else {
        console.log('[firebase-config]: Firebase Admin SDK already initialized.');
    }

    // Get the initialized services
    db = admin.firestore();
    auth = admin.auth();

} catch (error) {
    console.error('[firebase-config]: FATAL Error initializing Firebase Admin SDK:', error);
    // Optional: Rethrow or exit to prevent the app from starting in a broken state
    throw error;
}

// Export the initialized services
export { db, auth };
