"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Import controller and multer config
const resume_controller_1 = require("../controllers/resume.controller");
const multer_config_1 = __importDefault(require("../config/multer.config")); // Import the configured multer instance
const router = (0, express_1.Router)();
// GET /api/resumes - Get list of uploaded resumes for the user
router.get('/', // Root path relative to /api/resumes
auth_middleware_1.authenticateToken, resume_controller_1.getUploadedResumes);
// POST /api/resumes/upload - Upload and parse a resume
router.post('/upload', auth_middleware_1.authenticateToken, multer_config_1.default.single('resumeFile'), // Handle single file upload named 'resumeFile'
resume_controller_1.uploadResume // Process the uploaded file
);
// POST /api/resumes/:resumeId/analyze - Analyze a specific resume
router.post('/:resumeId/analyze', auth_middleware_1.authenticateToken, resume_controller_1.analyzeResume // Call the analysis controller function
);
// GET /api/resumes/:id - Get a specific uploaded resume
router.get('/:id', auth_middleware_1.authenticateToken, resume_controller_1.getResumeById);
// DELETE /api/resumes/:id - Delete a specific uploaded resume
router.delete('/:id', auth_middleware_1.authenticateToken, resume_controller_1.deleteResume);
exports.default = router;
