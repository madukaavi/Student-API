const mongoose = require("mongoose");

const Course = require("../models/course.model");
const Student = require("../models/student.model");

// ======================================
// 1. CREATE COURSE
// POST /api/courses
// ======================================
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      price,
      status
    } = req.body || {};

    const course = await Course.create({
      title,
      description,
      duration,
      price,
      status
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map(
          (err) => err.message
        )
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid field value"
      });
    }

    console.error("Create Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ======================================
// 2. GET ALL COURSES
// GET /api/courses
// ======================================
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ======================================
// 3. ENROLL STUDENT IN COURSE
// POST /api/courses/:courseId/enroll
// ======================================
const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body || {};

    // Validate both IDs
    if (
      !mongoose.isObjectIdOrHexString(courseId) ||
      !mongoose.isObjectIdOrHexString(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID or Student ID"
      });
    }

    // Find active course
    const course = await Course.findOne({
      _id: courseId,
      status: "active"
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Active course not found"
      });
    }

    // Find student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Prevent duplicate enrollment
    if (
      student.courseId &&
      student.courseId.toString() === courseId
    ) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course"
      });
    }

    // Check different course assignment
    if (student.courseId) {
      return res.status(409).json({
        success: false,
        message: "Student already has an assigned course"
      });
    }

    // Assign course reference and keep
    // legacy course name synchronized
    const updatedStudent =
      await Student.findOneAndUpdate(
        {
          _id: studentId,
          courseId: null
        },
        {
          $set: {
            courseId: course._id,
            course: course.title
          }
        },
        {
          new: true,
          runValidators: true
        }
      ).populate("courseId", "title duration price status");

    // Another request may have enrolled
    // this student in the meantime
    if (!updatedStudent) {
      return res.status(409).json({
        success: false,
        message: "Student course assignment changed"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student enrolled successfully",
      data: updatedStudent
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map(
          (err) => err.message
        )
      });
    }

    console.error("Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  enrollStudent
};