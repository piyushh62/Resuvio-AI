"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobs_controller_1 = require("../controllers/jobs.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all job routes
router.use(auth_middleware_1.authenticateToken);
router.get('/', jobs_controller_1.getJobs);
router.post('/', jobs_controller_1.createJob);
router.put('/:id', jobs_controller_1.updateJob);
router.delete('/:id', jobs_controller_1.deleteJob);
exports.default = router;
