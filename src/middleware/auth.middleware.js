const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Admin = require("../models/admin.model");

// =====================================
// VERIFY ADMIN JWT TOKEN
// =====================================
const protect = async (req, res, next) => {
  try {
    // 1. Read Authorization Header
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
    }

    // 2. Extract Token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // 3. Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    // 4. Validate Admin ID
    if (
      !decoded.sub ||
      !mongoose.isObjectIdOrHexString(decoded.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // 5. Check Admin Still Exists
    const admin = await Admin.findById(
      decoded.sub
    ).select("name email role");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    // 6. Attach Admin to Request
    req.admin = admin;

    // 7. Continue to Controller
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { protect };