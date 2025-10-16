"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Register
router.post("/register", rate_limit_middleware_1.rateLimiter, [
    (0, express_validator_1.body)("username").isLength({ min: 3, max: 100 }).trim(),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
    (0, express_validator_1.body)("role").optional().isIn(["admin", "operator", "viewer"]),
], auth_controller_1.AuthController.register);
// Login
router.post("/login", rate_limit_middleware_1.rateLimiter, [(0, express_validator_1.body)("username").notEmpty().trim(), (0, express_validator_1.body)("password").notEmpty()], auth_controller_1.AuthController.login);
// Verify token
router.get("/verify", auth_controller_1.AuthController.verify);
// Get profile (protected)
router.get("/profile", auth_middleware_1.authenticateToken, auth_controller_1.AuthController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map