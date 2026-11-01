const mongoose = require("mongoose");

const Attendance = require("../models/attendance.model");
const Enrollment = require("../models/enrollment.model");

const isValidId = (id) =>
  mongoose.isObjectIdOrHexString(id);

// Validate real calendar date
const isValidDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

const handleError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Attendance already marked for this date"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map(
        err => err.message
      )
    });
  }

  console.error("Attendance Error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

// ====================================
// 1. MARK ATTENDANCE
// POST /api/attendance
// ====================================
const markAttendance = async (req, res) => {
  try {
    const {
      enrollmentId,
      date,
      status,
      notes = ""
    } = req.body || {};

    if (!isValidId(enrollmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Enrollment ID"
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date. Use YYYY-MM-DD"
      });
    }

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be present or absent"
      });
    }

    if (
      typeof notes !== "string" ||
      notes.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notes"
      });
    }

    const enrollment = await Enrollment.findById(
      enrollmentId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    if (enrollment.status !== "active") {
      return res.status(409).json({
        success: false,
        message: "Enrollment is not active"
      });
    }

    // Friendly duplicate check
    const existing = await Attendance.findOne({
      enrollmentId,
      date
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this date"
      });
    }

    const attendance = await Attendance.create({
      enrollmentId,
      date,
      status,
      notes
    });

    await attendance.populate({
      path: "enrollmentId",
      populate: [
        { path: "studentId", select: "name email" },
        { path: "courseId", select: "title" }
      ]
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// ====================================
// 2. GET ALL ATTENDANCE
// GET /api/attendance
// ====================================
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate({
        path: "enrollmentId",
        populate: [
          { path: "studentId", select: "name email" },
          { path: "courseId", select: "title" }
        ]
      })
      .sort({ date: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// ====================================
// 3. GET ATTENDANCE + PERCENTAGE
// GET /api/attendance/enrollment/:id
// ====================================
const getEnrollmentAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Enrollment ID"
      });
    }

    const enrollment = await Enrollment.findById(id)
      .populate("studentId", "name email")
      .populate("courseId", "title duration");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    const records = await Attendance.find({
      enrollmentId: id
    })
      .sort({ date: -1 })
      .lean();

    const totalClasses = records.length;

    const present = records.filter(
      record => record.status === "present"
    ).length;

    const absent = records.filter(
      record => record.status === "absent"
    ).length;

    const percentage = totalClasses > 0
      ? Number(
          ((present / totalClasses) * 100).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      success: true,
      enrollment,
      summary: {
        totalClasses,
        present,
        absent,
        percentage
      },
      data: records
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// ====================================
// 4. UPDATE ATTENDANCE
// PATCH /api/attendance/:id
// ====================================
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Attendance ID"
      });
    }

    if (
      !["present", "absent"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be present or absent"
      });
    }

    if (
      notes !== undefined &&
      (typeof notes !== "string" || notes.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notes"
      });
    }

    const updateData = { status };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const attendance =
      await Attendance.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          returnDocument: "after",
          runValidators: true
        }
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance
    });

  } catch (error) {
    return handleError(error, res);
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getEnrollmentAttendance,
  updateAttendance
};