"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWorkspaceResume = exports.parseResumeUploadForWorkspace = exports.aiAssistResumeField = exports.duplicateWorkspaceResume = exports.deleteWorkspaceResume = exports.getWorkspaceResumes = exports.getWorkspaceResume = exports.saveWorkspaceResume = exports.getGeneratedResumes = exports.downloadGeneratedResume = exports.generateResume = void 0;
const pdf_lib_1 = require("pdf-lib");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
// Import initialized db from config
const firebase_config_1 = require("../config/firebase.config");
const firebase_admin_1 = __importDefault(require("firebase-admin")); // Still needed for admin.firestore.FieldValue
const ai_service_1 = require("../services/ai.service");
// Removed AI client init and parseJsonFromText, now using ai.service.ts
// Helper function to format input data for the prompt (optional but good practice)
const formatInputForPrompt = (data) => {
    let promptData = ``;
    promptData += `Personal Information:\nName: ${data.personalInfo.name}\nEmail: ${data.personalInfo.email}${data.personalInfo.phone ? `\nPhone: ${data.personalInfo.phone}` : ''}${data.personalInfo.linkedin ? `\nLinkedIn: ${data.personalInfo.linkedin}` : ''}${data.personalInfo.portfolio ? `\nPortfolio: ${data.personalInfo.portfolio}` : ''}${data.personalInfo.address ? `\nAddress: ${data.personalInfo.address}` : ''}\n\n`;
    if (data.summary)
        promptData += `Professional Summary:\n${data.summary}\n\n`;
    promptData += `Education:\n${data.education.map(edu => `- ${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy} ` : ''}at ${edu.institution}${edu.startDate || edu.endDate ? ` (${edu.startDate || ''} - ${edu.endDate || ''})` : ''}${edu.details ? `\n  Details: ${edu.details.join(', ')}` : ''}`).join('\n')}\n\n`;
    promptData += `Experience:\n${data.experience.map(exp => `- ${exp.jobTitle} at ${exp.company}${exp.location ? `, ${exp.location}` : ''} (${exp.startDate} - ${exp.endDate})\n  Responsibilities:\n${exp.responsibilities.map(r => `    * ${r}`).join('\n')}`).join('\n\n')}\n\n`;
    promptData += `Skills:\n${data.skills.map(skillSet => `${skillSet.category ? `${skillSet.category}: ` : ''}${skillSet.items.join(', ')}`).join('\n')}\n\n`;
    if (data.certifications && data.certifications.length > 0)
        promptData += `Certifications:\n${data.certifications.map(cert => `- ${cert.name}${cert.issuingOrganization ? ` (${cert.issuingOrganization})` : ''}${cert.dateObtained ? `, ${cert.dateObtained}` : ''}`).join('\n')}\n\n`;
    if (data.projects && data.projects.length > 0)
        promptData += `Projects:\n${data.projects.map(proj => `- ${proj.name}: ${proj.description}${proj.technologies ? ` (Tech: ${proj.technologies.join(', ')})` : ''}${proj.link ? ` [${proj.link}]` : ''}`).join('\n')}\n\n`;
    if (data.targetJobRole)
        promptData += `Target Job Role: ${data.targetJobRole}\n`;
    if (data.targetJobDescription)
        promptData += `Target Job Description:\n${data.targetJobDescription}\n`;
    return promptData.trim();
};
const generateResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        // TODO: Add robust validation for req.body against ResumeInputData structure
        const inputData = req.body;
        if (!inputData || !inputData.personalInfo || !inputData.experience || !inputData.education || !inputData.skills) {
            res.status(400).json({ message: 'Bad Request: Missing essential resume input data (personalInfo, experience, education, skills)' });
            return;
        }
        console.log(`[builder]: Starting resume generation for user: ${userId}`);
        // --- Prepare Prompt for Gemini --- 
        const formattedInput = formatInputForPrompt(inputData);
        const prompt = `
          Generate a professional resume based on the following information. 
          Format the output clearly with standard resume sections (Summary/Objective, Education, Experience, Skills, Projects, Certifications, etc. as applicable based on the provided data).
          Use bullet points for responsibilities and achievements under Experience.
          Tailor the resume towards the 'Target Job Role' if provided.
          Ensure the tone is professional and concise.

          Resume Information:
          --- START INFO ---
          ${formattedInput}
          --- END INFO ---

          Generated Resume Text:
        `;
        console.log(`[builder]: Sending prompt to Gemini for user: ${userId}`);
        const generatedText = await (0, ai_service_1.generateContent)(prompt);
        console.log(`[builder]: Received generated text from Gemini for user: ${userId}`);
        // --- Save to Firestore --- 
        const generatedResumeData = {
            userId,
            inputData,
            generatedText,
            version: 1,
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await firebase_config_1.db.collection('generatedResumes').add(generatedResumeData);
        console.log(`[builder]: Saved generated resume to Firestore with ID: ${docRef.id} for user: ${userId}`);
        // --- Return Generated Text --- 
        res.status(201).json({ message: 'Resume generated successfully', generatedResumeId: docRef.id, generatedText });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("[builder]: Resume generation error:", error.message);
            if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
                res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
            }
            else {
                res.status(500).json({ message: 'Internal server error during resume generation', error: error.message });
            }
        }
    }
};
exports.generateResume = generateResume;
// --- Download Generated Resume Function ---
const downloadGeneratedResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const generatedResumeId = req.params.generatedResumeId;
        if (!generatedResumeId) {
            res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
            return;
        }
        console.log(`[download]: Request to download generated resume ${generatedResumeId} for user ${userId}`);
        // Fetch generated resume from Firestore
        const resumeRef = firebase_config_1.db.collection('generatedResumes').doc(generatedResumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Generated resume not found' });
            return;
        }
        const resumeData = resumeDoc.data();
        // Verify ownership
        if (resumeData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this generated resume' });
            return;
        }
        if (!resumeData.generatedText || resumeData.generatedText.trim() === '') {
            res.status(400).json({ message: 'Cannot download: Generated resume text is missing or empty' });
            return;
        }
        console.log(`[download]: Generating PDF for generated resume ${generatedResumeId}`);
        // --- Create PDF using pdf-lib --- 
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage(); // Default A4 size
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const fontSize = 11;
        const margin = 50;
        const textWidth = width - 2 * margin;
        const lineHeight = fontSize * 1.2;
        let y = height - margin;
        // Very basic text wrapping (pdf-lib doesn't have built-in complex wrapping)
        // This splits by line and attempts basic word wrap per line.
        // For better formatting, rendering HTML to PDF via Puppeteer might be better.
        const lines = resumeData.generatedText.split('\n');
        for (const line of lines) {
            // Simple word wrap attempt
            let currentLine = '';
            const words = line.split(' ');
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                if (testWidth < textWidth) {
                    currentLine = testLine;
                }
                else {
                    // Draw the line that fits
                    page.drawText(currentLine, {
                        x: margin,
                        y: y,
                        font: font,
                        size: fontSize,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    });
                    y -= lineHeight; // Move down
                    currentLine = word; // Start new line with the current word
                    if (y < margin) { // Basic check for page overflow (doesn't add new page)
                        console.warn(`[download]: PDF content might be truncated for resume ${generatedResumeId}`);
                        break; // Stop drawing if out of space
                    }
                }
            }
            // Draw the last part of the line (or the whole line if it fit)
            page.drawText(currentLine, {
                x: margin,
                y: y,
                font: font,
                size: fontSize,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            y -= lineHeight;
            if (y < margin) {
                console.warn(`[download]: PDF content might be truncated for resume ${generatedResumeId}`);
                break;
            }
        }
        const pdfBytes = await pdfDoc.save();
        console.log(`[download]: PDF generated successfully for resume ${generatedResumeId}`);
        // --- Send PDF Response --- 
        res.setHeader('Content-Disposition', `attachment; filename="generated_resume_${generatedResumeId}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes)); // Send the PDF bytes
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[download]: Error generating or downloading PDF for resume ${req.params.generatedResumeId}:`, error.message);
            if (!res.headersSent) { // Avoid sending error if response already started
                if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
                    res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
                }
                else {
                    res.status(500).json({ message: 'Internal server error during PDF download', error: error.message });
                }
            }
        }
    }
};
exports.downloadGeneratedResume = downloadGeneratedResume;
// --- Get Generated Resumes Function ---
const getGeneratedResumes = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        console.log(`[getGenerated]: Fetching generated resumes for user ${userId}`);
        const resumesSnapshot = await firebase_config_1.db.collection('generatedResumes')
            .where('userId', '==', userId)
            .get();
        if (resumesSnapshot.empty) {
            console.log(`[getGenerated]: No generated resumes found for user ${userId}`);
            res.status(200).json({ generatedResumes: [] }); // Return empty array
            return;
        }
        const generatedResumes = resumesSnapshot.docs.map(doc => {
            const data = doc.data();
            // Return only necessary summary fields to the frontend
            return {
                id: doc.id,
                createdAt: data.createdAt,
                // Extract some identifying info from inputData if possible
                inputName: data.inputData?.personalInfo?.name,
                inputTargetRole: data.inputData?.targetJobRole,
                version: data.version,
                // Avoid sending the full inputData or generatedText in the list view
            };
        }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        console.log(`[getGenerated]: Found ${generatedResumes.length} generated resumes for user ${userId}`);
        res.status(200).json({ generatedResumes });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[getGenerated]: Error fetching generated resumes for user ${req.user?.uid}:`, error.message);
            const err = error;
            if (err.code === 'permission-denied' || err.status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            }
            else {
                res.status(500).json({ message: 'Internal server error fetching generated resumes', error: error.message });
            }
        }
    }
};
exports.getGeneratedResumes = getGeneratedResumes;
const saveWorkspaceResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const { resumeId, title, workspaceData } = req.body;
        if (!workspaceData || typeof workspaceData !== 'object') {
            res.status(400).json({ message: 'Bad Request: workspaceData is required' });
            return;
        }
        const resumeTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Untitled Resume';
        const collection = firebase_config_1.db.collection('resumeWorkspaces');
        if (resumeId) {
            const resumeRef = collection.doc(String(resumeId));
            const existing = await resumeRef.get();
            if (!existing.exists) {
                res.status(404).json({ message: 'Resume workspace not found' });
                return;
            }
            const existingData = existing.data();
            if (existingData.userId !== userId) {
                res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
                return;
            }
            await resumeRef.update({
                title: resumeTitle,
                workspaceData,
                updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            });
            res.status(200).json({ message: 'Resume saved successfully', resumeId });
            return;
        }
        const docRef = await collection.add({
            userId,
            title: resumeTitle,
            workspaceData,
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
        res.status(201).json({ message: 'Resume created successfully', resumeId: docRef.id });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceSave]: Error saving resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error saving resume workspace', error: error.message });
        }
    }
};
exports.saveWorkspaceResume = saveWorkspaceResume;
const getWorkspaceResume = async (req, res) => {
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
        const resumeDoc = await firebase_config_1.db.collection('resumeWorkspaces').doc(resumeId).get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }
        const data = resumeDoc.data();
        if (data.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
            return;
        }
        res.status(200).json({
            resumeId: resumeDoc.id,
            title: data.title,
            workspaceData: data.workspaceData,
            updatedAt: data.updatedAt,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceGet]: Error fetching resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error fetching resume workspace', error: error.message });
        }
    }
};
exports.getWorkspaceResume = getWorkspaceResume;
const getWorkspaceResumes = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const snapshot = await firebase_config_1.db.collection('resumeWorkspaces')
            .where('userId', '==', userId)
            .get();
        const workspaces = snapshot.docs.map(doc => {
            const data = doc.data();
            const workspaceData = data.workspaceData;
            return {
                id: doc.id,
                title: data.title,
                updatedAt: data.updatedAt,
                createdAt: data.createdAt,
                candidateName: workspaceData?.personal?.name || '',
                headline: workspaceData?.personal?.headline || '',
                templateId: workspaceData?.templateId || '',
                sectionCount: Array.isArray(workspaceData?.sections) ? workspaceData.sections.length : 0,
            };
        }).sort((a, b) => {
            const bTime = 'seconds' in (b.updatedAt || {}) ? b.updatedAt.seconds : 0;
            const aTime = 'seconds' in (a.updatedAt || {}) ? a.updatedAt.seconds : 0;
            return bTime - aTime;
        });
        res.status(200).json({ workspaces });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceList]: Error fetching resume workspaces:', error.message);
            res.status(500).json({ message: 'Internal server error fetching resume workspaces', error: error.message });
        }
    }
};
exports.getWorkspaceResumes = getWorkspaceResumes;
const deleteWorkspaceResume = async (req, res) => {
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
        const resumeRef = firebase_config_1.db.collection('resumeWorkspaces').doc(resumeId);
        const existing = await resumeRef.get();
        if (!existing.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }
        const existingData = existing.data();
        if (existingData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
            return;
        }
        await resumeRef.delete();
        res.status(200).json({ message: 'Resume deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceDelete]: Error deleting resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error deleting resume workspace', error: error.message });
        }
    }
};
exports.deleteWorkspaceResume = deleteWorkspaceResume;
const duplicateWorkspaceResume = async (req, res) => {
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
        const resumeRef = firebase_config_1.db.collection('resumeWorkspaces').doc(resumeId);
        const existing = await resumeRef.get();
        if (!existing.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }
        const existingData = existing.data();
        if (existingData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
            return;
        }
        const existingWorkspaceData = existingData.workspaceData;
        const newTitle = `${existingData.title || 'Untitled Resume'} (Copy)`;
        const docRef = await firebase_config_1.db.collection('resumeWorkspaces').add({
            userId,
            title: newTitle,
            workspaceData: {
                ...existingWorkspaceData,
                title: newTitle,
            },
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
        res.status(201).json({ message: 'Resume duplicated successfully', resumeId: docRef.id });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceDuplicate]: Error duplicating resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error duplicating resume workspace', error: error.message });
        }
    }
};
exports.duplicateWorkspaceResume = duplicateWorkspaceResume;
const aiAssistResumeField = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const { fieldType, currentText, context } = req.body;
        const safeFieldType = typeof fieldType === 'string' ? fieldType : 'resume field';
        const safeCurrentText = typeof currentText === 'string' ? currentText : '';
        const safeContext = typeof context === 'string' ? context : '';
        const prompt = `
Improve this ${safeFieldType} for a professional, ATS-friendly resume.
Keep it concise, specific, and truthful to the provided context.
Return only the improved text, no markdown wrapper.

Current text:
${safeCurrentText || '(empty)'}

Context:
${safeContext || '(none)'}
        `.trim();
        const responseText = await (0, ai_service_1.generateContent)(prompt);
        const suggestion = responseText.trim();
        res.status(200).json({ suggestion });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[aiAssist]: Error generating resume suggestion:', error.message);
            res.status(500).json({ message: 'Internal server error generating AI suggestion', error: error.message });
        }
    }
};
exports.aiAssistResumeField = aiAssistResumeField;
const parseResumeUploadForWorkspace = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'Bad Request: No file uploaded' });
            return;
        }
        let parsedText = '';
        if (req.file.mimetype === 'application/pdf') {
            const data = await (0, pdf_parse_1.default)(req.file.buffer);
            parsedText = data.text;
        }
        else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth_1.default.extractRawText({ buffer: req.file.buffer });
            parsedText = value;
        }
        else {
            res.status(400).json({ message: 'Unsupported file type. Upload a PDF or DOCX file.' });
            return;
        }
        if (!parsedText.trim()) {
            res.status(400).json({ message: 'Could not read text from uploaded resume.' });
            return;
        }
        const prompt = `
Convert the resume text into this exact JSON shape for a resume builder.
Return only valid JSON. Do not include markdown.
Use empty strings or empty arrays where data is missing.

{
  "title": "Untitled Resume",
  "templateId": "modern",
  "stylePreset": "mono",
  "layoutPreset": "steady",
  "sections": ["personal", "summary", "experience", "education", "skills"],
  "personal": {
    "name": "",
    "headline": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": []
  },
  "summary": "",
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "employmentType": "",
      "location": "",
      "dates": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "honors": "",
      "dates": "",
      "gpa": "",
      "description": ""
    }
  ],
  "skills": [
    {
      "category": "",
      "items": ""
    }
  ],
  "projects": [],
  "certifications": [],
  "extras": {},
  "targetJobDescription": ""
}

Resume text:
--- START ---
${parsedText.slice(0, 18000)}
--- END ---
        `.trim();
        const workspaceData = await (0, ai_service_1.generateJson)(prompt);
        res.status(200).json({
            message: 'Resume parsed successfully',
            workspaceData,
            sourceFilename: req.file.originalname,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('[workspaceParseUpload]: Error parsing uploaded resume:', error.message);
            res.status(500).json({ message: 'Internal server error parsing uploaded resume', error: error.message });
        }
    }
};
exports.parseResumeUploadForWorkspace = parseResumeUploadForWorkspace;
const analyzeWorkspaceResume = async (req, res) => {
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
        const docRef = firebase_config_1.db.collection('builderWorkspaces').doc(resumeId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(404).json({ message: 'Workspace not found' });
            return;
        }
        const data = docSnap.data();
        if (data.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this workspace' });
            return;
        }
        console.log(`[analyzeWorkspace]: Starting ATS analysis for workspace: ${resumeId}, User: ${userId}`);
        const resumeText = JSON.stringify(data.workspaceData, null, 2);
        const prompt = `
          Analyze the following resume data and provide feedback. Structure your response as a JSON object adhering STRICTLY to the following format:
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

          Resume Data:
          --- START RESUME ---
          ${resumeText}
          --- END RESUME ---

          Ensure your entire response is ONLY the JSON object requested, without any introductory text, code block markers (\`\`\`), or explanations.
        `;
        const analysisResult = await (0, ai_service_1.generateJson)(prompt);
        // Save analysis to the workspace document so they can see their score history
        await docRef.update({
            analysis: {
                ...analysisResult,
                analysisTimestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp()
            }
        });
        console.log(`[analyzeWorkspace]: Analysis results updated in Firestore for workspace: ${resumeId}`);
        res.status(200).json({ message: 'Workspace analyzed successfully', analysis: analysisResult });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[analyzeWorkspace]: Error analyzing workspace ${req.params.resumeId}:`, error.message);
            res.status(500).json({ message: 'Internal server error analyzing workspace', error: error.message });
        }
    }
};
exports.analyzeWorkspaceResume = analyzeWorkspaceResume;
