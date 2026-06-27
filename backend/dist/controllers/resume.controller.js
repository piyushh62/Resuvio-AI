"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResume = exports.getResumeById = exports.getUploadedResumes = exports.analyzeResume = exports.uploadResume = void 0;
// import admin from 'firebase-admin'; // Keep for FieldValue type
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
// Import initialized db from config
const firebase_config_1 = require("../config/firebase.config");
const firebase_admin_1 = __importDefault(require("firebase-admin")); // Still needed for admin.firestore.FieldValue
const ai_service_1 = require("../services/ai.service");
// Placeholder for uploadResume function
const uploadResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        // Check if a file was uploaded by multer
        if (!req.file) {
            res.status(400).json({ message: 'Bad Request: No file uploaded' });
            return;
        }
        const file = req.file;
        let parsedText = '';
        console.log(`[upload]: Processing file: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`);
        // Parse based on mimetype
        if (file.mimetype === 'application/pdf') {
            const data = await (0, pdf_parse_1.default)(file.buffer);
            parsedText = data.text;
            console.log(`[upload]: PDF parsed successfully.`);
        }
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth_1.default.extractRawText({ buffer: file.buffer });
            parsedText = value;
            console.log(`[upload]: DOCX parsed successfully.`);
        }
        else {
            // This case should ideally be prevented by multer's fileFilter, but handle defensively
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }
        // Create Resume data object
        const resumeData = {
            userId: userId,
            originalFilename: file.originalname,
            parsedText: parsedText,
            uploadTimestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            // analysis field will be added later in Phase 3
        };
        // Use imported db service
        const resumeRef = await firebase_config_1.db.collection('resumes').add(resumeData);
        console.log(`[upload]: Resume data saved to Firestore with ID: ${resumeRef.id}`);
        // Respond with the ID of the newly created resume document
        res.status(201).json({ message: 'Resume uploaded and parsed successfully', resumeId: resumeRef.id });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("[upload]: Resume upload/parsing error:", error.message);
            res.status(500).json({ message: 'Internal server error during resume processing', error: error.message });
        }
    }
};
exports.uploadResume = uploadResume;
// --- Analyze Resume Function ---
const analyzeResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const resumeId = req.params.resumeId;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }
        // Use imported db service
        const resumeRef = firebase_config_1.db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        const resumeData = resumeDoc.data();
        // Verify ownership
        if (resumeData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }
        if (!resumeData.parsedText || resumeData.parsedText.trim() === '') {
            res.status(400).json({ message: 'Cannot analyze empty resume text' });
            return;
        }
        console.log(`[analyze]: Starting analysis for resume: ${resumeId}, User: ${userId}`);
        // --- Prepare Prompt for Gemini --- (Aligned with frontend ResumeAnalysis interface)
        const prompt = `
          Analyze the following resume text and provide feedback. Structure your response as a JSON object adhering STRICTLY to the following format:
          {
            "overallScore": <integer score 0-100>,
            "categoryScores": {
              "formatting": <integer score 0-100 for layout, readability, consistency>,
              "content": <integer score 0-100 for clarity, conciseness, grammar, spelling>,
              "keywords": <integer score 0-100 for relevance of skills and terms to common job descriptions>,
              "impact": <integer score 0-100 for showcasing achievements and quantifiable results>
            },
            "suggestions": [<array of specific, actionable suggestion strings>],
            "strengths": [<array of specific strength strings>]
          }

          Resume Text:
          --- START RESUME ---
          ${resumeData.parsedText}
          --- END RESUME ---

          Ensure your entire response is ONLY the JSON object requested, without any introductory text, code block markers (\`\`\`), or explanations.

          JSON Response:
        `;
        // --- Call Gemini API and Parse Response ---
        let analysisResult = {};
        try {
            analysisResult = await (0, ai_service_1.generateJson)(prompt);
            console.log(`[analyze]: Successfully received and parsed JSON from Gemini for resume ${resumeId}.`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`[analyze]: Error calling Gemini or parsing response for resume ${resumeId}:`, error.message);
                res.status(500).json({ message: 'Failed to analyze resume or parse response', error: error.message });
                return;
            }
        }
        // --- Update Firestore --- 
        const analysisUpdateData = {
            analysis: {
                ...analysisResult, // Spread the parsed data
                analysisTimestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() // Keep admin namespace
            }
        };
        // Use resumeRef obtained earlier
        await resumeRef.update(analysisUpdateData);
        console.log(`[analyze]: Analysis results updated in Firestore for resume: ${resumeId}`);
        res.status(200).json({ message: 'Resume analyzed successfully', analysis: analysisUpdateData.analysis });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[analyze]: Error during resume analysis for resume ${req.params.resumeId}:`, error.message);
            if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
                res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
            }
            else if (error.code === 'permission-denied' || error.status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            }
            else {
                res.status(500).json({ message: 'Internal server error during analysis', error: error.message });
            }
        }
    }
};
exports.analyzeResume = analyzeResume;
// --- Get Uploaded Resumes Function ---
const getUploadedResumes = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        console.log(`[getResumes]: Fetching uploaded resumes for user ${userId}`);
        const resumesSnapshot = await firebase_config_1.db.collection('resumes')
            .where('userId', '==', userId)
            .get();
        if (resumesSnapshot.empty) {
            console.log(`[getResumes]: No uploaded resumes found for user ${userId}`);
            res.status(200).json({ resumes: [] }); // Return empty array, not an error
            return;
        }
        const resumes = resumesSnapshot.docs.map(doc => {
            const data = doc.data();
            // Return only necessary fields to the frontend
            return {
                id: doc.id,
                originalFilename: data.originalFilename,
                uploadTimestamp: data.uploadTimestamp,
                overallScore: data.analysis?.overallScore, // Include score if available
                analysisTimestamp: data.analysis?.analysisTimestamp
            };
        }).sort((a, b) => (b.uploadTimestamp?.seconds || 0) - (a.uploadTimestamp?.seconds || 0));
        console.log(`[getResumes]: Found ${resumes.length} uploaded resumes for user ${userId}`);
        res.status(200).json({ resumes });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[getResumes]: Error fetching uploaded resumes for user ${req.user?.uid}:`, error.message);
            if (error.code === 'permission-denied' || error.status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            }
            else {
                res.status(500).json({ message: 'Internal server error fetching uploaded resumes', error: error.message });
            }
        }
    }
};
exports.getUploadedResumes = getUploadedResumes;
// --- Get Resume By ID Function ---
const getResumeById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const resumeId = req.params.id;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resume ID' });
            return;
        }
        const resumeRef = firebase_config_1.db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        const resumeData = resumeDoc.data();
        if (resumeData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }
        res.status(200).json({ resume: { id: resumeDoc.id, ...resumeData } });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[getResumeById]: Error fetching resume ${req.params.id}:`, error.message);
            res.status(500).json({ message: 'Internal server error fetching resume', error: error.message });
        }
    }
};
exports.getResumeById = getResumeById;
// --- Delete Resume Function ---
const deleteResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const resumeId = req.params.id;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resume ID' });
            return;
        }
        const resumeRef = firebase_config_1.db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        const resumeData = resumeDoc.data();
        if (resumeData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }
        await resumeRef.delete();
        console.log(`[deleteResume]: Resume ${resumeId} deleted by user ${userId}`);
        res.status(200).json({ message: 'Resume deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[deleteResume]: Error deleting resume ${req.params.id}:`, error.message);
            res.status(500).json({ message: 'Internal server error deleting resume', error: error.message });
        }
    }
};
exports.deleteResume = deleteResume;
