const express = require("express");

const {
  createCourse,
  getAllCourses,
  enrollStudent
} = require("../controllers/course.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

// Require Admin JWT for all Course APIs
router.use(protect);

// CREATE COURSE
router.post("/", createCourse);

// GET ALL COURSES
router.get("/", getAllCourses);

// ENROLL STUDENT
router.post("/:courseId/enroll", enrollStudent);

module.exports = router;