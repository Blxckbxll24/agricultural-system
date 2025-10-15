import { Router } from "express"
import { body, param } from "express-validator"
import { ParcelController } from "../controllers/parcel.controller"
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware"

const router = Router()

// Public routes (with authentication)
router.get("/", authenticateToken, ParcelController.getAllParcels)

router.get("/statistics", authenticateToken, ParcelController.getStatistics)

router.get("/deleted", authenticateToken, authorizeRoles("admin", "operator"), ParcelController.getDeletedParcels)

router.get("/:id", authenticateToken, [param("id").isInt()], ParcelController.getParcelById)

// Protected routes (admin and operator only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "operator"),
  [
    body("name").notEmpty().trim(),
    body("location").notEmpty().trim(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("area_hectares").isFloat({ min: 0 }),
    body("crop_type").notEmpty().trim(),
    body("planting_date").optional().isISO8601(),
    body("status").optional().isIn(["active", "inactive", "maintenance"]),
  ],
  ParcelController.createParcel,
)

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "operator"),
  [
    param("id").isInt(),
    body("name").optional().trim(),
    body("location").optional().trim(),
    body("latitude").optional().isFloat({ min: -90, max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 }),
    body("area_hectares").optional().isFloat({ min: 0 }),
    body("crop_type").optional().trim(),
    body("planting_date").optional().isISO8601(),
    body("status").optional().isIn(["active", "inactive", "maintenance"]),
  ],
  ParcelController.updateParcel,
)

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  [param("id").isInt(), body("deleted_by").optional().trim(), body("deletion_reason").optional().trim()],
  ParcelController.deleteParcel,
)

export default router
