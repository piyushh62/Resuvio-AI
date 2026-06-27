"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Ensure env vars are loaded
dotenv_1.default.config();
let db;
let auth;
try {
    console.log('[firebase-config]: Attempting Firebase Admin SDK initialization...');
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    let credential;
    if (serviceAccountBase64) {
        const decodedServiceAccount = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        credential = firebase_admin_1.default.credential.cert(JSON.parse(decodedServiceAccount));
    }
    else if (serviceAccountJson) {
        credential = firebase_admin_1.default.credential.cert(JSON.parse(serviceAccountJson));
    }
    else if (serviceAccountPath) {
        // Resolve absolute path in case relative path is provided
        const resolvedPath = path_1.default.resolve(serviceAccountPath);
        credential = firebase_admin_1.default.credential.cert(resolvedPath);
    }
    else {
        throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_SERVICE_ACCOUNT_BASE64.');
    }
    // Check if already initialized (useful for hot-reloading environments)
    if (firebase_admin_1.default.apps.length === 0) {
        firebase_admin_1.default.initializeApp({
            credential
        });
        console.log('[firebase-config]: Firebase Admin SDK initialized successfully.');
    }
    else {
        console.log('[firebase-config]: Firebase Admin SDK already initialized.');
    }
    // Get the initialized services
    exports.db = db = firebase_admin_1.default.firestore();
    exports.auth = auth = firebase_admin_1.default.auth();
}
catch (error) {
    console.error('[firebase-config]: FATAL Error initializing Firebase Admin SDK:', error);
    // Optional: Rethrow or exit to prevent the app from starting in a broken state
    throw error;
}
