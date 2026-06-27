"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCoverLetterController = void 0;
const firebase_config_1 = require("../config/firebase.config"); // Import Firestore instance
const ai_service_1 = require("../services/ai.service");
// Controller to handle cover letter generation requests
const generateCoverLetterController = async (req, res) => {
    // Ensure user is authenticated (middleware should have already done this)
    if (!req.user || !req.user.uid) {
        res.status(401).json({ message: 'Unauthorized: User not authenticated or UID missing.' });
        return;
    }
    const userId = req.user.uid;
    const { selectedResume, // This is the resume ID
    jobDescription, companyName, roleName, selectedTemplate } = req.body;
    if (!selectedResume || !jobDescription) {
        res.status(400).json({ message: 'Bad Request: Missing selected resume ID or job description.' });
        return;
    }
    console.log(`[CoverLetterGen] User: ${userId} attempting to generate cover letter.`);
    console.log(`[CoverLetterGen] Using Resume ID: ${selectedResume}, Company: ${companyName}, Role: ${roleName}, Template: ${selectedTemplate}`);
    try {
        // 1. Fetch resume content based on selectedResume ID and user ID
        const resumeRef = firebase_config_1.db.collection('resumes').doc(selectedResume);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            console.warn(`[CoverLetterGen] Resume not found: ID ${selectedResume} for user ${userId}`);
            res.status(404).json({ message: 'Selected resume not found.' });
            return;
        }
        const resumeData = resumeDoc.data();
        // Verify ownership of the resume
        if (resumeData.userId !== userId) {
            console.warn(`[CoverLetterGen] User ${userId} attempted to access unauthorized resume ${selectedResume}`);
            res.status(403).json({ message: 'Forbidden: You do not have permission to use this resume.' });
            return;
        }
        if (!resumeData.parsedText || resumeData.parsedText.trim() === '') {
            console.warn(`[CoverLetterGen] Resume ${selectedResume} has no parsable text for user ${userId}`);
            res.status(400).json({ message: 'Selected resume contains no text to use for generation.' });
            return;
        }
        const resumeContent = resumeData.parsedText;
        console.log(`[CoverLetterGen] Successfully fetched resume content for ${selectedResume}. Length: ${resumeContent.length}`);
        // 2. Construct AI prompt using fetched resume, job details, and template
        let templateInstructions = "Write in a standard professional tone.";
        if (selectedTemplate === "modern") {
            templateInstructions = "Write in a confident, slightly less formal, modern professional tone. Use strong action verbs.";
        }
        else if (selectedTemplate === "creative") {
            templateInstructions = "Write in a creative and engaging tone. Feel free to use a more unique structure or opening, while still being professional.";
        }
        const prompt = `
          Generate a professional cover letter based *strictly* on the provided resume and job description.
          
          **Instructions:**
          1.  Tailor the letter for the position of **${roleName || '[Role Name]'}** at **${companyName || '[Company Name]'}**.
          2.  Use the tone specified: **${templateInstructions}**
          3.  Highlight relevant skills and experiences from the resume that match the job description.
          4.  Structure it as a standard cover letter (introduction, body paragraphs connecting experience to the role, conclusion).
          5.  Do **NOT** invent skills or experiences not present in the resume.
          6.  Address it generically (e.g., "Dear Hiring Manager,") unless a specific name is implied in the job description (which is unlikely here).
          7.  Conclude professionally (e.g., "Sincerely,").
          8.  The final output should be **ONLY** the full text of the cover letter, with appropriate paragraph breaks (using \\n\\n). Do **NOT** include any surrounding text, commentary, markdown formatting like \`\`, or labels.
          
          **Resume Content:**
          --- START RESUME ---
          ${resumeContent}
          --- END RESUME ---
          
          **Job Description:**
          --- START JOB DESCRIPTION ---
          ${jobDescription}
          --- END JOB DESCRIPTION ---
          
          **Generated Cover Letter Text Only:**
        `;
        console.log(`[CoverLetterGen] Prompt constructed for Gemini. Template: ${selectedTemplate}`);
        // 3. Call AI service to generate the cover letter
        const generatedCoverLetter = await (0, ai_service_1.generateContent)(prompt);
        if (!generatedCoverLetter || generatedCoverLetter.trim() === '') {
            console.error(`[CoverLetterGen] Gemini returned empty response for user ${userId}, resume ${selectedResume}`);
            throw new Error('AI generation resulted in an empty cover letter.');
        }
        console.log(`[CoverLetterGen] Received cover letter from Gemini. Length: ${generatedCoverLetter.length}`);
        // TODO: 4. (Optional) Save the generated letter
        res.status(200).json({
            message: "Cover letter generated successfully",
            generatedCoverLetter: generatedCoverLetter.trim(), // Trim whitespace from AI response
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[CoverLetterGen] Error for user ${req.user?.uid}, resume ${req.body.selectedResume}:`, error.message);
            let errorMessage = 'Failed to generate cover letter due to an internal error.';
            if (error.message.includes('GOOGLE_API_KEY_INVALID') || error.message.includes('API key not valid')) {
                errorMessage = 'Internal Server Error: Invalid Gemini API Key configured.';
            }
            else if (error.message.includes('429') || error.message.includes('rate limit')) {
                errorMessage = 'AI service is busy. Please try again in a moment.';
            }
            else if (error.code === 'permission-denied') {
                errorMessage = 'Database permission error while fetching resume.';
            }
            else if (error.message.includes('AI generation resulted in an empty')) {
                errorMessage = error.message; // Use the specific error message
            }
            else if (error.response?.status === 500) {
                const apiError = error;
                if (apiError.response?.data && typeof apiError.response.data === 'object' && 'message' in apiError.response.data) {
                    errorMessage = `AI Service Error: ${apiError.response.data.message}`;
                }
            }
            res.status(500).json({ message: errorMessage });
        }
    }
};
exports.generateCoverLetterController = generateCoverLetterController;
