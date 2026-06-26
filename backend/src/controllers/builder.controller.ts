import { Request, Response } from 'express';
// import admin from 'firebase-admin'; // Keep for FieldValue
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GeneratedResume, ResumeInputData } from '../models/generated-resume.model';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
// Import initialized db from config
import { db } from '../config/firebase.config';
import admin from 'firebase-admin'; // Still needed for admin.firestore.FieldValue

interface CustomRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

interface WorkspaceResumeDraft {
    userId: string;
    title: string;
    workspaceData: unknown;
    createdAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
    updatedAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

const parseJsonFromText = (text: string): unknown => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI response did not contain a JSON object.');
    }
    return JSON.parse(jsonMatch[0]);
};

// const db = admin.firestore(); // Removed: Use imported db

// Re-initialize AI client (Consider centralizing this later)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Old model
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

// Helper function to format input data for the prompt (optional but good practice)
const formatInputForPrompt = (data: ResumeInputData): string => {
    let promptData = ``;
    promptData += `Personal Information:\nName: ${data.personalInfo.name}\nEmail: ${data.personalInfo.email}${data.personalInfo.phone ? `\nPhone: ${data.personalInfo.phone}` : ''}${data.personalInfo.linkedin ? `\nLinkedIn: ${data.personalInfo.linkedin}` : ''}${data.personalInfo.portfolio ? `\nPortfolio: ${data.personalInfo.portfolio}` : ''}${data.personalInfo.address ? `\nAddress: ${data.personalInfo.address}` : ''}\n\n`;
    if (data.summary) promptData += `Professional Summary:\n${data.summary}\n\n`;
    promptData += `Education:\n${data.education.map(edu => `- ${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy} ` : ''}at ${edu.institution}${edu.startDate || edu.endDate ? ` (${edu.startDate || ''} - ${edu.endDate || ''})` : ''}${edu.details ? `\n  Details: ${edu.details.join(', ')}` : ''}`).join('\n')}\n\n`;
    promptData += `Experience:\n${data.experience.map(exp => `- ${exp.jobTitle} at ${exp.company}${exp.location ? `, ${exp.location}` : ''} (${exp.startDate} - ${exp.endDate})\n  Responsibilities:\n${exp.responsibilities.map(r => `    * ${r}`).join('\n')}`).join('\n\n')}\n\n`;
    promptData += `Skills:\n${data.skills.map(skillSet => `${skillSet.category ? `${skillSet.category}: ` : ''}${skillSet.items.join(', ')}`).join('\n')}\n\n`;
    if (data.certifications && data.certifications.length > 0) promptData += `Certifications:\n${data.certifications.map(cert => `- ${cert.name}${cert.issuingOrganization ? ` (${cert.issuingOrganization})` : ''}${cert.dateObtained ? `, ${cert.dateObtained}` : ''}`).join('\n')}\n\n`;
    if (data.projects && data.projects.length > 0) promptData += `Projects:\n${data.projects.map(proj => `- ${proj.name}: ${proj.description}${proj.technologies ? ` (Tech: ${proj.technologies.join(', ')})` : ''}${proj.link ? ` [${proj.link}]` : ''}`).join('\n')}\n\n`;
    if (data.targetJobRole) promptData += `Target Job Role: ${data.targetJobRole}\n`;
    if (data.targetJobDescription) promptData += `Target Job Description:\n${data.targetJobDescription}\n`;
    return promptData.trim();
};

export const generateResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;

        // TODO: Add robust validation for req.body against ResumeInputData structure
        const inputData: ResumeInputData = req.body;
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

        // --- Call Gemini API --- 
        const generationConfig = { temperature: 0.5 }; // Allow some creativity
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log(`[builder]: Sending prompt to Gemini for user: ${userId}`);
        const result = await model.generateContent(
            prompt
            // { generationConfig, safetySettings } // Consider enabling these
        );
        const response = await result.response;
        const generatedText = response.text();
        console.log(`[builder]: Received generated text from Gemini for user: ${userId}`);

        // --- Save to Firestore --- 
        const generatedResumeData: Omit<GeneratedResume, 'id'> = {
            userId,
            inputData,
            generatedText,
            version: 1,
            createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        };

        const docRef = await db.collection('generatedResumes').add(generatedResumeData);
        console.log(`[builder]: Saved generated resume to Firestore with ID: ${docRef.id} for user: ${userId}`);

        // --- Return Generated Text --- 
        res.status(201).json({ message: 'Resume generated successfully', generatedResumeId: docRef.id, generatedText });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("[builder]: Resume generation error:", error.message);
            if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
                res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
            } else {
                res.status(500).json({ message: 'Internal server error during resume generation', error: error.message });
            }
        }
    }
};

// --- Download Generated Resume Function ---
export const downloadGeneratedResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const generatedResumeId = req.params.generatedResumeId as string;

        if (!generatedResumeId) {
            res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
            return;
        }

        console.log(`[download]: Request to download generated resume ${generatedResumeId} for user ${userId}`);

        // Fetch generated resume from Firestore
        const resumeRef = db.collection('generatedResumes').doc(generatedResumeId);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Generated resume not found' });
            return;
        }

        const resumeData = resumeDoc.data() as GeneratedResume;

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
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(); // Default A4 size
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
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
                } else {
                    // Draw the line that fits
                    page.drawText(currentLine, {
                        x: margin,
                        y: y,
                        font: font,
                        size: fontSize,
                        color: rgb(0, 0, 0),
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
                color: rgb(0, 0, 0),
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

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[download]: Error generating or downloading PDF for resume ${req.params.generatedResumeId}:`, error.message);
            if (!res.headersSent) { // Avoid sending error if response already started
                if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
                    res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
                } else {
                    res.status(500).json({ message: 'Internal server error during PDF download', error: error.message });
                }
            }
        }
    }
};

// --- Get Generated Resumes Function ---
export const getGeneratedResumes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;

        console.log(`[getGenerated]: Fetching generated resumes for user ${userId}`);

        const resumesSnapshot = await db.collection('generatedResumes')
            .where('userId', '==', userId)
            .get();

        if (resumesSnapshot.empty) {
            console.log(`[getGenerated]: No generated resumes found for user ${userId}`);
            res.status(200).json({ generatedResumes: [] }); // Return empty array
            return;
        }

        const generatedResumes = resumesSnapshot.docs.map(doc => {
            const data = doc.data() as GeneratedResume;
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

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[getGenerated]: Error fetching generated resumes for user ${req.user?.uid}:`, error.message);
            const err = error as { code?: string; status?: string; message: string };
            if (err.code === 'permission-denied' || err.status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            } else {
                res.status(500).json({ message: 'Internal server error fetching generated resumes', error: error.message });
            }
        }
    }
}; 

export const saveWorkspaceResume = async (req: CustomRequest, res: Response): Promise<void> => {
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
        const collection = db.collection('resumeWorkspaces');

        if (resumeId) {
            const resumeRef = collection.doc(String(resumeId));
            const existing = await resumeRef.get();

            if (!existing.exists) {
                res.status(404).json({ message: 'Resume workspace not found' });
                return;
            }

            const existingData = existing.data() as WorkspaceResumeDraft;
            if (existingData.userId !== userId) {
                res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
                return;
            }

            await resumeRef.update({
                title: resumeTitle,
                workspaceData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).json({ message: 'Resume saved successfully', resumeId });
            return;
        }

        const docRef = await collection.add({
            userId,
            title: resumeTitle,
            workspaceData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Resume created successfully', resumeId: docRef.id });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceSave]: Error saving resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error saving resume workspace', error: error.message });
        }
    }
};

export const getWorkspaceResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }

        const userId = req.user.uid;
        const resumeId = req.params.resumeId as string;

        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeDoc = await db.collection('resumeWorkspaces').doc(resumeId).get();

        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }

        const data = resumeDoc.data() as WorkspaceResumeDraft;
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
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceGet]: Error fetching resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error fetching resume workspace', error: error.message });
        }
    }
};

export const getWorkspaceResumes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }

        const userId = req.user.uid;
        const snapshot = await db.collection('resumeWorkspaces')
            .where('userId', '==', userId)
            .get();

        const workspaces = snapshot.docs.map(doc => {
            const data = doc.data() as WorkspaceResumeDraft;
            const workspaceData = data.workspaceData as {
                personal?: { name?: string; headline?: string };
                templateId?: string;
                sections?: unknown[];
            };

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
            const bTime = 'seconds' in (b.updatedAt || {}) ? (b.updatedAt as admin.firestore.Timestamp).seconds : 0;
            const aTime = 'seconds' in (a.updatedAt || {}) ? (a.updatedAt as admin.firestore.Timestamp).seconds : 0;
            return bTime - aTime;
        });

        res.status(200).json({ workspaces });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceList]: Error fetching resume workspaces:', error.message);
            res.status(500).json({ message: 'Internal server error fetching resume workspaces', error: error.message });
        }
    }
};

export const deleteWorkspaceResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }

        const userId = req.user.uid;
        const resumeId = req.params.resumeId as string;

        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeRef = db.collection('resumeWorkspaces').doc(resumeId);
        const existing = await resumeRef.get();

        if (!existing.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }

        const existingData = existing.data() as WorkspaceResumeDraft;
        if (existingData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
            return;
        }

        await resumeRef.delete();
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceDelete]: Error deleting resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error deleting resume workspace', error: error.message });
        }
    }
};

export const duplicateWorkspaceResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }

        const userId = req.user.uid;
        const resumeId = req.params.resumeId as string;

        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeRef = db.collection('resumeWorkspaces').doc(resumeId);
        const existing = await resumeRef.get();

        if (!existing.exists) {
            res.status(404).json({ message: 'Resume workspace not found' });
            return;
        }

        const existingData = existing.data() as WorkspaceResumeDraft;
        if (existingData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume workspace' });
            return;
        }

        const existingWorkspaceData = existingData.workspaceData as Record<string, unknown>;
        const newTitle = `${existingData.title || 'Untitled Resume'} (Copy)`;

        const docRef = await db.collection('resumeWorkspaces').add({
            userId,
            title: newTitle,
            workspaceData: {
                ...existingWorkspaceData,
                title: newTitle,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Resume duplicated successfully', resumeId: docRef.id });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceDuplicate]: Error duplicating resume workspace:', error.message);
            res.status(500).json({ message: 'Internal server error duplicating resume workspace', error: error.message });
        }
    }
};

export const aiAssistResumeField = async (req: CustomRequest, res: Response): Promise<void> => {
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const suggestion = response.text().trim();

        res.status(200).json({ suggestion });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[aiAssist]: Error generating resume suggestion:', error.message);
            res.status(500).json({ message: 'Internal server error generating AI suggestion', error: error.message });
        }
    }
};

export const parseResumeUploadForWorkspace = async (req: CustomRequest, res: Response): Promise<void> => {
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
            const data = await pdfParse(req.file.buffer);
            parsedText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
            parsedText = value;
        } else {
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const workspaceData = parseJsonFromText(response.text());

        res.status(200).json({
            message: 'Resume parsed successfully',
            workspaceData,
            sourceFilename: req.file.originalname,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[workspaceParseUpload]: Error parsing uploaded resume:', error.message);
            res.status(500).json({ message: 'Internal server error parsing uploaded resume', error: error.message });
        }
    }
};
