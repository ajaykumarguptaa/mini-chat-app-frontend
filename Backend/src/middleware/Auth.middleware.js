import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =req.headers.authorization || req.get("Authorization") || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message || err);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
