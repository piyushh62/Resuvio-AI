import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import upload from '../config/multer.config';
import {
    aiAssistResumeField,
    deleteWorkspaceResume,
    downloadGeneratedResume,
    duplicateWorkspaceResume,
    generateResume,
    getGeneratedResumes,
    getWorkspaceResume,
    getWorkspaceResumes,
    parseResumeUploadForWorkspace,
    parseResumeTextForWorkspace,
    saveWorkspaceResume,
    analyzeWorkspaceResume,
} from '../controllers/builder.controller';
import { exportResume } from '../controllers/export.controller';

const router = Router();

// GET /api/builder/generated - Get list of generated resumes for the user
router.get(
    '/generated',
    authenticateToken,
    getGeneratedResumes
);

// POST /api/builder/generate - Generate a resume based on input data
router.post(
    '/generate',
    authenticateToken, // Ensure user is authenticated
    generateResume // Use the controller function
);

// POST /api/builder/workspace - Create or update a structured resume workspace
router.post(
    '/workspace',
    authenticateToken,
    saveWorkspaceResume
);

// GET /api/builder/workspaces - List structured resume workspaces
router.get(
    '/workspaces',
    authenticateToken,
    getWorkspaceResumes
);

// GET /api/builder/workspace/:resumeId - Load one structured resume workspace
router.get(
    '/workspace/:resumeId',
    authenticateToken,
    getWorkspaceResume
);

// POST /api/builder/assist - Improve one resume field with AI
router.post(
    '/assist',
    authenticateToken,
    aiAssistResumeField
);

// POST /api/builder/parse-upload - Parse PDF/DOCX and prefill workspace data
router.post(
    '/parse-upload',
    authenticateToken,
    upload.single('resumeFile'),
    parseResumeUploadForWorkspace
);

// POST /api/builder/parse-text - Parse raw text and prefill workspace data
router.post(
    '/parse-text',
    authenticateToken,
    parseResumeTextForWorkspace
);

// GET /api/builder/download/:generatedResumeId - Download a generated resume as PDF
router.get(
    '/download/:generatedResumeId',
    authenticateToken, // Ensure user is authenticated
    downloadGeneratedResume // Use the download controller function
);

// DELETE /api/builder/workspace/:resumeId - Delete a resume workspace
router.delete(
    '/workspace/:resumeId',
    authenticateToken,
    deleteWorkspaceResume
);

// POST /api/builder/workspace/:resumeId/duplicate - Duplicate a resume workspace
router.post(
    '/workspace/:resumeId/duplicate',
    authenticateToken,
    duplicateWorkspaceResume
);

// POST /api/builder/export - Export a resume workspace as PDF or DOCX
router.post(
    '/export',
    authenticateToken,
    exportResume
);

// POST /api/builder/workspace/:resumeId/analyze - Analyze a workspace ATS score
router.post(
    '/workspace/:resumeId/analyze',
    authenticateToken,
    analyzeWorkspaceResume
);

export default router;
