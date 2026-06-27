"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_config_1 = __importDefault(require("../config/multer.config"));
const builder_controller_1 = require("../controllers/builder.controller");
const export_controller_1 = require("../controllers/export.controller");
const router = (0, express_1.Router)();
// GET /api/builder/generated - Get list of generated resumes for the user
router.get('/generated', auth_middleware_1.authenticateToken, builder_controller_1.getGeneratedResumes);
// POST /api/builder/generate - Generate a resume based on input data
router.post('/generate', auth_middleware_1.authenticateToken, // Ensure user is authenticated
builder_controller_1.generateResume // Use the controller function
);
// POST /api/builder/workspace - Create or update a structured resume workspace
router.post('/workspace', auth_middleware_1.authenticateToken, builder_controller_1.saveWorkspaceResume);
// GET /api/builder/workspaces - List structured resume workspaces
router.get('/workspaces', auth_middleware_1.authenticateToken, builder_controller_1.getWorkspaceResumes);
// GET /api/builder/workspace/:resumeId - Load one structured resume workspace
router.get('/workspace/:resumeId', auth_middleware_1.authenticateToken, builder_controller_1.getWorkspaceResume);
// POST /api/builder/assist - Improve one resume field with AI
router.post('/assist', auth_middleware_1.authenticateToken, builder_controller_1.aiAssistResumeField);
// POST /api/builder/parse-upload - Parse PDF/DOCX and prefill workspace data
router.post('/parse-upload', auth_middleware_1.authenticateToken, multer_config_1.default.single('resumeFile'), builder_controller_1.parseResumeUploadForWorkspace);
// GET /api/builder/download/:generatedResumeId - Download a generated resume as PDF
router.get('/download/:generatedResumeId', auth_middleware_1.authenticateToken, // Ensure user is authenticated
builder_controller_1.downloadGeneratedResume // Use the download controller function
);
// DELETE /api/builder/workspace/:resumeId - Delete a resume workspace
router.delete('/workspace/:resumeId', auth_middleware_1.authenticateToken, builder_controller_1.deleteWorkspaceResume);
// POST /api/builder/workspace/:resumeId/duplicate - Duplicate a resume workspace
router.post('/workspace/:resumeId/duplicate', auth_middleware_1.authenticateToken, builder_controller_1.duplicateWorkspaceResume);
// POST /api/builder/export - Export a resume workspace as PDF or DOCX
router.post('/export', auth_middleware_1.authenticateToken, export_controller_1.exportResume);
// POST /api/builder/workspace/:resumeId/analyze - Analyze a workspace ATS score
router.post('/workspace/:resumeId/analyze', auth_middleware_1.authenticateToken, builder_controller_1.analyzeWorkspaceResume);
exports.default = router;
