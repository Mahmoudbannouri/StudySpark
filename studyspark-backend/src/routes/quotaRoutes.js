import express from "express";
import {
  getQuotaByUser,
  updateQuota,
  getAllQuotas,
  getMyQuota,
  getQuotaStatistics,
  getUserQuotaHistory,
  resetUserQuota,
  bulkUpdateQuotas,
  applySubscriptionPlanToUser,
  customizeUserQuota,
  getAdminQuotaDetails
} from "../controllers/quotaController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes - user can access their own quota
router.get("/me", protect, getMyQuota);

// Admin only routes - must come before :id parameter route
router.get("/statistics", protect, authorizeRoles("admin"), getQuotaStatistics);
router.get("/user/:userId/history", protect, authorizeRoles("admin"), getUserQuotaHistory);
router.post("/user/:userId/reset", protect, authorizeRoles("admin"), resetUserQuota);
router.put("/bulk-update", protect, authorizeRoles("admin"), bulkUpdateQuotas);

// New Admin quota management endpoints
router.get("/admin/details/:userId", protect, authorizeRoles("admin"), getAdminQuotaDetails);
router.post("/admin/apply-plan/:userId", protect, authorizeRoles("admin"), applySubscriptionPlanToUser);
router.put("/admin/customize/:userId", protect, authorizeRoles("admin"), customizeUserQuota);

// Admin only - get all quotas
router.get("/", protect, authorizeRoles("admin"), getAllQuotas);

// Protected routes - get and update specific user quota
router.get("/:id", protect, getQuotaByUser);
router.put("/:id", protect, updateQuota);

export default router;
