const express = require("express");

const {
  createEnrollment,
  getAllEnrollments,
  getStudentEnrollments,
  getCourseEnrollments,
  updateEnrollmentStatus
} = require("../controllers/enrollment.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all Enrollment Routes
router.use(protect);

// CREATE ENROLLMENT
router.post("/", createEnrollment);

// GET ALL ENROLLMENTS
router.get("/", getAllEnrollments);

// GET STUDENT ENROLLMENTS
router.get(
  "/student/:studentId",
  getStudentEnrollments
);

// GET COURSE ENROLLMENTS
router.get(
  "/course/:courseId",
  getCourseEnrollments
);

// UPDATE ENROLLMENT STATUS
router.patch(
  "/:id/status",
  updateEnrollmentStatus
);

module.exports = router;