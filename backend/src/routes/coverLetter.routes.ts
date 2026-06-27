import { Router } from 'express';
import { generateCoverLetterController, getCoverLetters, deleteCoverLetter } from '../controllers/coverLetter.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/cover-letter/generate - Generate a cover letter
router.post('/generate', requireAuth, generateCoverLetterController);

// GET /api/cover-letter - Get all cover letters for user
router.get('/', requireAuth, getCoverLetters);

// DELETE /api/cover-letter/:id - Delete a specific cover letter
router.delete('/:id', requireAuth, deleteCoverLetter);

export default router;