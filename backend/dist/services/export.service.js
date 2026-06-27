"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdfFromHtml = generatePdfFromHtml;
exports.generateDocxFromData = generateDocxFromData;
const puppeteer_1 = __importDefault(require("puppeteer"));
const docx_1 = require("docx");
/**
 * Generates a PDF buffer from HTML content using Puppeteer.
 * @param htmlContent The fully rendered HTML string of the resume.
 * @returns A Buffer containing the PDF data.
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // We set the content with waitUntil: 'networkidle0' to ensure any fonts/images load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
        }
    });
    await browser.close();
    return Buffer.from(pdfBuffer);
}
/**
 * Generates a clean, ATS-friendly DOCX buffer from resume JSON data.
 * @param resumeData The structured resume workspace data.
 * @returns A Buffer containing the DOCX file data.
 */
async function generateDocxFromData(resumeData) {
    const { personal, summary, experience, education, skills } = resumeData;
    const sections = [];
    // Personal Info Header
    sections.push(new docx_1.Paragraph({
        text: personal?.name || 'Untitled Resume',
        heading: docx_1.HeadingLevel.HEADING_1,
        alignment: docx_1.AlignmentType.CENTER,
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        children: [
            new docx_1.TextRun(personal?.email || ''),
            new docx_1.TextRun(personal?.phone ? ` | ${personal.phone}` : ''),
            new docx_1.TextRun(personal?.location ? ` | ${personal.location}` : ''),
        ]
    }), new docx_1.Paragraph({ text: "" }) // Spacer
    );
    // Summary
    if (summary) {
        sections.push(new docx_1.Paragraph({ text: "Professional Summary", heading: docx_1.HeadingLevel.HEADING_2 }), new docx_1.Paragraph({ text: summary }), new docx_1.Paragraph({ text: "" }) // Spacer
        );
    }
    // Experience
    if (experience && experience.length > 0) {
        sections.push(new docx_1.Paragraph({ text: "Experience", heading: docx_1.HeadingLevel.HEADING_2 }));
        experience.forEach((exp) => {
            sections.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: `${exp.jobTitle} at ${exp.company}`, bold: true }),
                    new docx_1.TextRun({ text: ` | ${exp.dates}`, italics: true }),
                ]
            }), new docx_1.Paragraph({ text: exp.description }), new docx_1.Paragraph({ text: "" }) // Spacer
            );
        });
    }
    // Education
    if (education && education.length > 0) {
        sections.push(new docx_1.Paragraph({ text: "Education", heading: docx_1.HeadingLevel.HEADING_2 }));
        education.forEach((edu) => {
            sections.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: `${edu.degree} - ${edu.institution}`, bold: true }),
                    new docx_1.TextRun({ text: ` | ${edu.dates}`, italics: true }),
                ]
            }), new docx_1.Paragraph({ text: edu.description || '' }), new docx_1.Paragraph({ text: "" }) // Spacer
            );
        });
    }
    // Skills
    if (skills && skills.length > 0) {
        sections.push(new docx_1.Paragraph({ text: "Skills", heading: docx_1.HeadingLevel.HEADING_2 }));
        skills.forEach((skillGroup) => {
            sections.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: `${skillGroup.category}: `, bold: true }),
                    new docx_1.TextRun(skillGroup.items),
                ]
            }));
        });
    }
    const doc = new docx_1.Document({
        sections: [
            {
                properties: {},
                children: sections
            }
        ]
    });
    return await docx_1.Packer.toBuffer(doc);
}
