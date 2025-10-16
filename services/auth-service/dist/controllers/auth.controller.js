"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h";
class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { username, email, password, full_name, role = "viewer" } = req.body;
            // Check if user already exists
            const [existingUsers] = await database_1.default.query("SELECT id FROM users WHERE username = ? OR email = ?", [
                username,
                email,
            ]);
            if (existingUsers.length > 0) {
                return res.status(409).json({ error: "Username or email already exists" });
            }
            // Hash password
            const password_hash = await bcrypt_1.default.hash(password, 10);
            // Insert user
            const [result] = await database_1.default.query("INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)", [username, email, password_hash, role, full_name || null]);
            const userId = result.insertId;
            // Generate token
            const token = jsonwebtoken_1.default.sign({ userId, username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: userId,
                    username,
                    email,
                    role,
                    full_name: full_name || null,
                },
            });
        }
        catch (error) {
            console.error("[Auth] Register error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    // Login user
    static async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { username, password } = req.body;
            // Find user
            const [users] = await database_1.default.query("SELECT * FROM users WHERE username = ? AND is_active = true", [
                username,
            ]);
            if (users.length === 0) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const user = users[0];
            // Verify password
            const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Update last login
            await database_1.default.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
            // Generate token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
            });
        }
        catch (error) {
            console.error("[Auth] Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    // Verify token
    static async verify(req, res) {
        try {
            const token = req.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return res.status(401).json({ error: "No token provided" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Get user details
            const [users] = await database_1.default.query("SELECT id, username, email, role, full_name, is_active FROM users WHERE id = ? AND is_active = true", [decoded.userId]);
            if (users.length === 0) {
                return res.status(401).json({ error: "User not found or inactive" });
            }
            res.json({
                valid: true,
                user: {
                    id: users[0].id,
                    username: users[0].username,
                    email: users[0].email,
                    role: users[0].role,
                    full_name: users[0].full_name,
                },
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ error: "Invalid token" });
            }
            console.error("[Auth] Verify error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    // Get user profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const [users] = await database_1.default.query("SELECT id, username, email, role, full_name, is_active, created_at, last_login FROM users WHERE id = ?", [userId]);
            if (users.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ user: users[0] });
        }
        catch (error) {
            console.error("[Auth] Get profile error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map