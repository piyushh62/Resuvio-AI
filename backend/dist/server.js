"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Firebase admin import might not be needed here anymore if init is handled elsewhere
// import admin from 'firebase-admin'; 
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const resume_routes_1 = __importDefault(require("./routes/resume.routes")); // Import resume routes
const builder_routes_1 = __importDefault(require("./routes/builder.routes")); // Import builder routes
const match_routes_1 = __importDefault(require("./routes/match.routes")); // Import match routes
const tips_routes_1 = __importDefault(require("./routes/tips.routes")); // Import tips routes
const coverLetter_routes_1 = __importDefault(require("./routes/coverLetter.routes")); // Import the new routes
const activity_routes_1 = __importDefault(require("./routes/activity.routes")); // Import activity routes
const credit_routes_1 = __importDefault(require("./routes/credit.routes")); // Import credit/usage routes
const payment_routes_1 = __importDefault(require("./routes/payment.routes")); // Import payment routes
dotenv_1.default.config(); // Load environment variables from .env file
// --- Firebase Admin SDK Initialization REMOVED (handled in config/firebase.config.ts) ---
// try { ... } catch { ... } block removed
// ------------------------------------------------------------------------------------
const app = (0, express_1.default)();
const port = process.env.PORT || 3001; // Default to 3001 if PORT not in .env
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL specified in .env
    credentials: true, // Optional: If you need to send cookies or authorization headers
}));
app.use(express_1.default.json({ limit: '50mb' })); // Parse JSON request bodies (increased limit for large HTML payloads)
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); // Parse URL-encoded request bodies
// API Routes
app.use('/api/auth', auth_routes_1.default); // Use auth routes under /api/auth
app.use('/api/resumes', resume_routes_1.default); // Use resume routes under /api/resumes
app.use('/api/builder', builder_routes_1.default); // Use builder routes under /api/builder
app.use('/api/match', match_routes_1.default); // Use match routes under /api/match
app.use('/api/tips', tips_routes_1.default); // Use tips routes under /api/tips
app.use('/api/cover-letter', coverLetter_routes_1.default); // Use the new routes
app.use('/api/activity', activity_routes_1.default); // Use activity routes
app.use('/api/credits', credit_routes_1.default); // Use credit/usage routes
app.use('/api/payments', payment_routes_1.default); // Use payment routes
// Basic route
app.get('/', (req, res) => {
    res.send('AI Resume Pro Backend is running!');
});
// Start the server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}
exports.default = app; // Export the app instance for testing
