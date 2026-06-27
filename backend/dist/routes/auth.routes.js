"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import controller functions
const auth_controller_1 = require("../controllers/auth.controller"); // Import signup and login
const router = (0, express_1.Router)();
// Define authentication routes
router.post('/signup', auth_controller_1.signup); // Use the imported signup controller
router.post('/login', auth_controller_1.login); // Use the imported login controller
exports.default = router;
