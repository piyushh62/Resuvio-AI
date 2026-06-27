"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJson = exports.generateContent = void 0;
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini AI
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Default safety settings
const defaultSafetySettings = [
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
/**
 * Generates plain text content using Gemini.
 */
const generateContent = async (prompt) => {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: defaultSafetySettings,
    });
    return result.response.text();
};
exports.generateContent = generateContent;
/**
 * Generates JSON structured content using Gemini.
 * By setting responseMimeType to 'application/json', we guarantee valid JSON without regex parsing.
 */
const generateJson = async (prompt) => {
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
exports.generateJson = generateJson;
