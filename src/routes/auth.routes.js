const express = require("express");

const {
  loginAdmin,
  getMyProfile
} = require("../controllers/auth.controller");

const { protect } = require(
  "../middleware/auth.middleware"
);

const router = express.Router();

// PUBLIC ROUTE
router.post("/login", loginAdmin);

// PROTECTED ROUTE
router.get("/me", protect, getMyProfile);

module.exports = router;