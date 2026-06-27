"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getJobs = void 0;
const firebase_config_1 = require("../config/firebase.config");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const getJobs = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const snapshot = await firebase_config_1.db.collection('jobApplications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const jobs = [];
        snapshot.forEach((doc) => {
            jobs.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ jobs });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getJobs = getJobs;
const createJob = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const { companyName, position, status, appliedDate, resumeWorkspaceId, jobDescription, location, salaryExpectation, notes } = req.body;
        if (!companyName || !position || !status) {
            res.status(400).json({ message: 'companyName, position, and status are required' });
            return;
        }
        const newJob = {
            userId,
            companyName,
            position,
            status: status,
            appliedDate: appliedDate || null,
            resumeWorkspaceId: resumeWorkspaceId || null,
            jobDescription: jobDescription || '',
            location: location || '',
            salaryExpectation: salaryExpectation || '',
            notes: notes || '',
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await firebase_config_1.db.collection('jobApplications').add(newJob);
        // Send back the new job with the generated ID
        res.status(201).json({ job: { id: docRef.id, ...newJob } });
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createJob = createJob;
const updateJob = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const jobId = String(req.params.id);
        const updates = req.body;
        const docRef = firebase_config_1.db.collection('jobApplications').doc(jobId);
        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        const jobData = doc.data();
        if (jobData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        // Only allow updating certain fields
        const allowedUpdates = ['companyName', 'position', 'status', 'appliedDate', 'resumeWorkspaceId', 'jobDescription', 'location', 'salaryExpectation', 'notes'];
        const updateData = {
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp()
        };
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                updateData[key] = updates[key];
            }
        }
        await docRef.update(updateData);
        res.status(200).json({ message: 'Job updated successfully' });
    }
    catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateJob = updateJob;
const deleteJob = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const jobId = String(req.params.id);
        const docRef = firebase_config_1.db.collection('jobApplications').doc(jobId);
        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        const jobData = doc.data();
        if (jobData.userId !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await docRef.delete();
        res.status(200).json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteJob = deleteJob;
