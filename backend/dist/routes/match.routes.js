"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_config_1 = __importDefault(require("../config/multer.config")); // Import multer configuration
// Import controller
const match_controller_1 = require("../controllers/match.controller");
const router = (0, express_1.Router)();
// POST /api/match/resume-job - Compare a resume (file or text) to a job description
router.post('/resume-job', auth_middleware_1.authenticateToken, // Ensure user is authenticated
multer_config_1.default.single('resumeFile'), // Handle single file upload named 'resumeFile'
match_controller_1.matchResumeToJob // Use the controller function
);
exports.default = router;
