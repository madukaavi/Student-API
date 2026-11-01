const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin.model");

// =====================================
// ADMIN LOGIN
// POST /api/auth/login
// =====================================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate Request
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // 2. Find Admin and Include Password
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Compare Password
    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 4. Ensure JWT Secret Exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // 5. Generate JWT Token
    const token = jwt.sign(
      {
        role: admin.role
      },
      process.env.JWT_SECRET,
      {
        subject: admin._id.toString(),
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    // 6. Send Response
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      tokenType: "Bearer",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// =====================================
// GET LOGGED-IN ADMIN PROFILE
// GET /api/auth/me
// =====================================
const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin profile fetched",
    data: req.admin
  });
};

module.exports = {
  loginAdmin,
  getMyProfile
};