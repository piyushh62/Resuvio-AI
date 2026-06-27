"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coverLetter_controller_1 = require("../controllers/coverLetter.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/cover-letter/generate - Generate a cover letter
router.post('/generate', auth_middleware_1.requireAuth, coverLetter_controller_1.generateCoverLetterController);
exports.default = router;
