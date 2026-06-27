"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.authenticateToken = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach decoded user info to the request object
        console.log(`[auth]: User authenticated: ${decodedToken.uid}`);
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("[auth]: Token verification failed:", error.message);
            const err = error;
            if (err.code === 'auth/id-token-expired') {
                res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
            else {
                res.status(401).json({ message: 'Unauthorized: Token verification failed', error: err.message });
            }
        }
    }
};
exports.authenticateToken = authenticateToken;
// Export authenticateToken as requireAuth for consistency across the codebase
exports.requireAuth = exports.authenticateToken;
