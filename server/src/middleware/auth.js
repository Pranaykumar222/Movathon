import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// This middleware runs BEFORE any protected route handler.
// It reads the JWT from the Authorization header, verifies it,
// and attaches the decoded user data to req.user.
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // "Bearer eyJ..." → "eyJ..."
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Now every protected route can use req.user.id
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};