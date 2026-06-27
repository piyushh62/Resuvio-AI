import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Default safety settings
const defaultSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Generates plain text content using Gemini.
 */
export const generateContent = async (prompt: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: defaultSafetySettings,
    });
    return result.response.text();
};

/**
 * Generates JSON structured content using Gemini.
 * By setting responseMimeType to 'application/json', we guarantee valid JSON without regex parsing.
 */
export const generateJson = async (prompt: string): Promise<unknown> => {
    const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: defaultSafetySettings,
    });
    
    const text = result.response.text();
    return JSON.parse(text);
};
