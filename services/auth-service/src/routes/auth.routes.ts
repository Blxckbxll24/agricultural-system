import { Router } from "express"
import { body } from "express-validator"
import { AuthController } from "../controllers/auth.controller"
import { authenticateToken } from "../middleware/auth.middleware"
import { rateLimiter } from "../middleware/rate-limit.middleware"

const router = Router()

// Register
router.post(
  "/register",
  rateLimiter,
  [
    body("username").isLength({ min: 3, max: 100 }).trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["admin", "operator", "viewer"]),
  ],
  AuthController.register,
)

// Login
router.post(
  "/login",
  rateLimiter,
  [body("username").notEmpty().trim(), body("password").notEmpty()],
  AuthController.login,
)

// Verify token
router.get("/verify", AuthController.verify)

// Get profile (protected)
router.get("/profile", authenticateToken, AuthController.getProfile)

export default router
