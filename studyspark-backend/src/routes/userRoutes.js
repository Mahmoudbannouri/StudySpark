import express from "express";
import {
  registeruser,
  loginUser,
  updateUserRole,
  getAllUsers,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registeruser);
router.post("/login", loginUser);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllUsers);

// Example: only students can access their own profile (for later)
router.get("/me", protect, authorizeRoles("student", "admin"), (req, res) => {
  res.json({ message: `Hello ${req.user.email}, your role is ${req.user.role}` });
});
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);

export default router;
