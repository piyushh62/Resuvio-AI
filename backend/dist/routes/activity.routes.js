"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET /api/activity/recent - Get recent activity for the user
router.get('/recent', auth_middleware_1.authenticateToken, (req, res) => {
    // For now, return mock data. In a real application, this would fetch from a database.
    const mockActivities = [
        {
            id: 'act1',
            title: 'Uploaded Resume "My_Resume.pdf"',
            description: 'Your resume was successfully uploaded.',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            type: 'resume_upload'
        },
        {
            id: 'act2',
            title: 'Analyzed "Software_Engineer_Resume.docx"',
            description: 'Resume analysis complete, 90% score.',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            type: 'resume_analysis'
        },
        {
            id: 'act3',
            title: 'Generated Cover Letter for "Senior Developer"',
            description: 'A new cover letter was generated.',
            date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            type: 'cover_letter_generation'
        }
    ];
    res.json(mockActivities);
});
exports.default = router;
