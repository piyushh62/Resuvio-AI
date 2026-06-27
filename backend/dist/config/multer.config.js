"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Define allowed mime types
const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];
// Configure file filter
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    }
    else {
        cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.')); // Reject file
        // Note: It's often better to handle this error gracefully in the controller or an error handling middleware
    }
};
// Configure multer storage (using memory storage for simplicity)
const storage = multer_1.default.memoryStorage();
// Create multer instance
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
});
exports.default = upload;
