import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
// Import controller and multer config
import { uploadResume, analyzeResume, getUploadedResumes, getResumeById, deleteResume } from '../controllers/resume.controller';
import upload from '../config/multer.config'; // Import the configured multer instance

const router = Router();

// GET /api/resumes - Get list of uploaded resumes for the user
router.get(
    '/', // Root path relative to /api/resumes
    authenticateToken,
    getUploadedResumes
);

// POST /api/resumes/upload - Upload and parse a resume
router.post(
    '/upload',
    authenticateToken,
    upload.single('resumeFile'), // Handle single file upload named 'resumeFile'
    uploadResume // Process the uploaded file
);

// POST /api/resumes/:resumeId/analyze - Analyze a specific resume
router.post(
    '/:resumeId/analyze',
    authenticateToken,
    analyzeResume // Call the analysis controller function
);

// GET /api/resumes/:id - Get a specific uploaded resume
router.get(
    '/:id',
    authenticateToken,
    getResumeById
);

// DELETE /api/resumes/:id - Delete a specific uploaded resume
router.delete(
    '/:id',
    authenticateToken,
    deleteResume
);
export default router; 