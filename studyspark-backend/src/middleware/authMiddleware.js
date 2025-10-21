import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Protect middleware:
 * Ensures the user is authenticated (has a valid token)
 */
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authorized, no token", message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token", message: "Invalid or expired token" });
  }
};

/**
 * authorizeRoles middleware:
 * Restricts route access to specific roles (e.g., admin, student, etc.)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated", message: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied: Role '${req.user.role}' not authorized for this action`,
        message: `Access denied: Role '${req.user.role}' not authorized for this action`,
      });
    }
    next();
  };
};
