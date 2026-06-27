"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportResume = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const docx_1 = require("docx");
const exportResume = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { format, html, workspaceData, title } = req.body;
        if (!format || (format !== 'pdf' && format !== 'docx')) {
            res.status(400).json({ message: 'Invalid format. Must be pdf or docx' });
            return;
        }
        const fileName = (title || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (format === 'pdf') {
            if (!html) {
                res.status(400).json({ message: 'HTML content required for PDF export' });
                return;
            }
            console.log(`[export]: Generating PDF for ${req.user.uid}`);
            // Launch puppeteer
            const browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // The frontend HTML usually references external stylesheets (like Tailwind).
            // Puppeteer needs to render them. Since we might send raw HTML with inline styles,
            // we use setContent. We also wait until network is idle to load fonts/images if any.
            await page.setContent(html, { waitUntil: 'domcontentloaded' });
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' }
            });
            await browser.close();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
            res.send(Buffer.from(pdfBuffer));
        }
        else if (format === 'docx') {
            if (!workspaceData) {
                res.status(400).json({ message: 'workspaceData required for DOCX export' });
                return;
            }
            console.log(`[export]: Generating DOCX for ${req.user.uid}`);
            // Extract personal info
            const personal = workspaceData.personal || {};
            const contactText = [personal.email, personal.phone, personal.location]
                .filter(Boolean)
                .join(' | ');
            // Create document
            const doc = new docx_1.Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new docx_1.Paragraph({
                                text: personal.name || 'Name',
                                heading: docx_1.HeadingLevel.HEADING_1,
                                alignment: docx_1.AlignmentType.CENTER,
                            }),
                            new docx_1.Paragraph({
                                text: personal.headline || '',
                                alignment: docx_1.AlignmentType.CENTER,
                                spacing: { after: 200 }
                            }),
                            new docx_1.Paragraph({
                                text: contactText,
                                alignment: docx_1.AlignmentType.CENTER,
                                spacing: { after: 400 }
                            }),
                            ...(workspaceData.summary ? [
                                new docx_1.Paragraph({
                                    text: "Professional Summary",
                                    heading: docx_1.HeadingLevel.HEADING_2,
                                    spacing: { before: 200, after: 100 }
                                }),
                                new docx_1.Paragraph({
                                    text: workspaceData.summary,
                                    spacing: { after: 200 }
                                })
                            ] : []),
                            ...(workspaceData.experience && workspaceData.experience.length > 0 ? [
                                new docx_1.Paragraph({
                                    text: "Experience",
                                    heading: docx_1.HeadingLevel.HEADING_2,
                                    spacing: { before: 200, after: 100 }
                                }),
                                ...workspaceData.experience.flatMap((exp) => [
                                    new docx_1.Paragraph({
                                        children: [
                                            new docx_1.TextRun({ text: exp.jobTitle, bold: true }),
                                            new docx_1.TextRun({ text: ` at ${exp.company}` }),
                                        ],
                                        spacing: { before: 100 }
                                    }),
                                    new docx_1.Paragraph({
                                        children: [
                                            new docx_1.TextRun({ text: `${exp.dates} | ${exp.location}`, italics: true })
                                        ]
                                    }),
                                    new docx_1.Paragraph({
                                        text: exp.description,
                                        spacing: { after: 100 }
                                    })
                                ])
                            ] : []),
                            ...(workspaceData.education && workspaceData.education.length > 0 ? [
                                new docx_1.Paragraph({
                                    text: "Education",
                                    heading: docx_1.HeadingLevel.HEADING_2,
                                    spacing: { before: 200, after: 100 }
                                }),
                                ...workspaceData.education.flatMap((edu) => [
                                    new docx_1.Paragraph({
                                        children: [
                                            new docx_1.TextRun({ text: edu.degree, bold: true }),
                                            new docx_1.TextRun({ text: ` - ${edu.institution}` }),
                                        ],
                                        spacing: { before: 100 }
                                    }),
                                    new docx_1.Paragraph({
                                        children: [
                                            new docx_1.TextRun({ text: edu.dates, italics: true })
                                        ],
                                        spacing: { after: 100 }
                                    })
                                ])
                            ] : []),
                            ...(workspaceData.skills && workspaceData.skills.length > 0 ? [
                                new docx_1.Paragraph({
                                    text: "Skills",
                                    heading: docx_1.HeadingLevel.HEADING_2,
                                    spacing: { before: 200, after: 100 }
                                }),
                                ...workspaceData.skills.map((skill) => new docx_1.Paragraph({
                                    children: [
                                        new docx_1.TextRun({ text: `${skill.category}: `, bold: true }),
                                        new docx_1.TextRun({ text: skill.items }),
                                    ]
                                }))
                            ] : [])
                        ],
                    },
                ],
            });
            const docxBuffer = await docx_1.Packer.toBuffer(doc);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
            res.send(Buffer.from(docxBuffer));
        }
    }
    catch (error) {
        console.error('[export]: Export error:', error);
        res.status(500).json({ message: 'Internal server error during export' });
    }
};
exports.exportResume = exportResume;
