const mongoose = require("mongoose");

const Student = require("../models/student.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const isValidId = (id) =>
  mongoose.isObjectIdOrHexString(id);

// Common error handler
const handleError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Student already enrolled in this course"
    });
  }

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

  console.error("Enrollment Error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

// =====================================
// 1. CREATE ENROLLMENT
// POST /api/enrollments
// =====================================
const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId } = req.body || {};

    if (!isValidId(studentId) || !isValidId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Valid studentId and courseId required"
      });
    }

    // Check Student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check Active Course
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

    // Check Existing Enrollment
    const existing = await Enrollment.findOne({
      studentId,
      courseId
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course",
        enrollmentStatus: existing.status
      });
    }

    // Create Enrollment
    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: "active"
    });

    // Populate Student and Course
    await enrollment.populate([
      {
        path: "studentId",
        select: "name email"
      },
      {
        path: "courseId",
        select: "title duration price"
      }
    ]);

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// =====================================
// 2. GET ALL ENROLLMENTS
// GET /api/enrollments
// =====================================
const getAllEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "active",
      "completed",
      "cancelled"
    ];

    const filter = {};

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enrollment status"
        });
      }

      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("studentId", "name email")
      .populate("courseId", "title duration price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// =====================================
// 3. GET ENROLLMENTS BY STUDENT
// GET /api/enrollments/student/:studentId
// =====================================
const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID"
      });
    }

    const student = await Student.findById(studentId)
      .select("name email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const enrollments = await Enrollment.find({
      studentId
    })
      .populate(
        "courseId",
        "title duration price status"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      student,
      count: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// =====================================
// 4. GET ENROLLMENTS BY COURSE
// GET /api/enrollments/course/:courseId
// =====================================
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID"
      });
    }

    const course = await Course.findById(courseId)
      .select("title duration price");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const enrollments = await Enrollment.find({
      courseId
    })
      .populate("studentId", "name email age")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      course,
      count: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// =====================================
// 5. UPDATE ENROLLMENT STATUS
// PATCH /api/enrollments/:id/status
// =====================================
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Enrollment ID"
      });
    }

    const allowedStatuses = [
      "active",
      "completed",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status"
      });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    // Only active enrollments can be closed
    if (enrollment.status !== "active") {
      return res.status(409).json({
        success: false,
        message: "Only active enrollments can be updated"
      });
    }

    if (status === "active") {
      return res.status(400).json({
        success: false,
        message: "Choose completed or cancelled"
      });
    }

    enrollment.status = status;

    enrollment.completedAt =
      status === "completed" ? new Date() : null;

    await enrollment.save();

    await enrollment.populate([
      {
        path: "studentId",
        select: "name email"
      },
      {
        path: "courseId",
        select: "title duration"
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Enrollment status updated",
      data: enrollment
    });

  } catch (error) {
    return handleError(error, res);
  }
};

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getStudentEnrollments,
  getCourseEnrollments,
  updateEnrollmentStatus
};