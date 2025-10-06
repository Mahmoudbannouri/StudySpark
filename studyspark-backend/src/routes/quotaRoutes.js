import express from "express";
import { getQuotaByUser, updateQuota, getAllQuotas,getMyQuota } from "../controllers/quotaController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, authorizeRoles("admin"), getAllQuotas);
router.get("/:id", protect, getQuotaByUser);
 router.put("/:id", protect, updateQuota);
 router.get("/me", protect, getMyQuota);


export default router;
