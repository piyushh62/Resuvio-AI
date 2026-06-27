"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Temporarily commented out server import and related code for debugging
describe('Simple Test Suite', () => {
    it('should pass a simple test', () => {
        expect(1 + 1).toBe(2);
    });
});
describe('GET / - Basic Server Test', () => {
    let app;
    beforeAll(async () => {
        try {
            // Refined Mock for Firebase Admin SDK 
            jest.mock('firebase-admin', () => ({
                initializeApp: jest.fn(),
                credential: {
                    cert: jest.fn(),
                },
                // Return mock objects for chained calls if any occur during import
                firestore: jest.fn(() => ({
                    collection: jest.fn(() => ({ doc: jest.fn(), add: jest.fn() })),
                    FieldValue: { serverTimestamp: jest.fn() }
                })),
                auth: jest.fn(() => ({
                    createUser: jest.fn(),
                    verifyIdToken: jest.fn(),
                }))
            }));
            // Ensure dotenv runs for potential env vars needed by server during import
            // (Although firebase init is mocked, other parts might use process.env)
            const serverModule = await Promise.resolve().then(() => __importStar(require('../server')));
            app = serverModule.default;
        }
        catch (err) {
            console.error("Failed to import server for testing:", err);
            throw err;
        }
    });
    it('should respond with the welcome message', async () => {
        if (!app)
            throw new Error("App not initialized for testing");
        const response = await (0, supertest_1.default)(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('AI Resume Pro Backend is running!');
    });
});
