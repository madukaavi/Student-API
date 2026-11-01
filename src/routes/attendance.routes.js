const express = require("express");

const {
  markAttendance,
  getAllAttendance,
  getEnrollmentAttendance,
  updateAttendance
} = require("../controllers/attendance.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

// All attendance routes require Admin JWT
router.use(protect);

// MARK ATTENDANCE
router.post("/", markAttendance);

// GET ALL ATTENDANCE
router.get("/", getAllAttendance);

// GET ENROLLMENT ATTENDANCE REPORT
router.get(
  "/enrollment/:id",
  getEnrollmentAttendance
);

// UPDATE ATTENDANCE
router.patch("/:id", updateAttendance);

module.exports = router;