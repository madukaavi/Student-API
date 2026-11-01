const mongoose = require("mongoose");
const Student = require("../models/student.model");

// ======================================
// HELPER: HANDLE DATABASE ERRORS
// ======================================
const handleError = (error, res) => {
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
      message: "Invalid field value",
      field: error.path
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Student email already exists"
    });
  }

  console.error("Student API Error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

// Escape special regex characters
const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ======================================
// 1. CREATE STUDENT
// POST /api/students
// ======================================
const createStudent = async (req, res) => {
  try {
    const { name, email, age, phone, course } =
      req.body || {};

    const student = await Student.create({
      name,
      email,
      age,
      phone,
      course
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// ======================================
// 2. GET ALL / SEARCH / FILTER / PAGE
// GET /api/students
// ======================================
const getAllStudents = async (req, res) => {
  try {
    const {
      search,
      course,
      minAge,
      maxAge,
      page = "1",
      limit = "10",
      sort = "newest"
    } = req.query;

    // Validate query parameter types
    const values = [
      search, course, minAge, maxAge,
      page, limit, sort
    ];

    if (
      values.some((value) =>
        value !== undefined &&
        typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters"
      });
    }

    // Pagination validation
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      !Number.isSafeInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be >= 1 and limit 1-100"
      });
    }

    // Allowed sorting options
    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      name_asc: { name: 1, _id: 1 },
      name_desc: { name: -1, _id: -1 },
      age_asc: { age: 1, _id: 1 },
      age_desc: { age: -1, _id: -1 }
    };

    if (!sortOptions[sort]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option"
      });
    }

    // Build MongoDB Filter
    const filter = {};

    // Search by Student Name
    if (search && search.trim()) {
      if (search.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Search text is too long"
        });
      }

      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i"
      };
    }

    // Filter by Course
    if (course && course.trim()) {
      if (course.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Course text is too long"
        });
      }

      filter.course = {
        $regex: `^${escapeRegex(course.trim())}$`,
        $options: "i"
      };
    }

    // Filter by Age
    if (minAge !== undefined ||
        maxAge !== undefined) {

      const min = minAge !== undefined
        ? Number(minAge)
        : 0;

      const max = maxAge !== undefined
        ? Number(maxAge)
        : 150;

      if (
        !Number.isInteger(min) ||
        !Number.isInteger(max) ||
        min < 0 ||
        max > 150 ||
        min > max
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid age range"
        });
      }

      filter.age = {
        $gte: min,
        $lte: max
      };
    }

    // Calculate Skip
    const skip = (pageNumber - 1) * limitNumber;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Page number is too large"
      });
    }

    // Database Queries
    const [students, totalStudents] =
      await Promise.all([
        Student.find(filter)
          .sort(sortOptions[sort])
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Student.countDocuments(filter)
      ]);

    const totalPages = Math.ceil(
      totalStudents / limitNumber
    );

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      count: students.length,
      totalStudents,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1 &&
          totalPages > 0
      },
      data: students
    });

  } catch (error) {
    return handleError(error, res);
  }
};

// ======================================
// 3. GET STUDENT BY ID
// ======================================
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID"
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// ======================================
// 4. UPDATE STUDENT
// ======================================
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID"
      });
    }

    const updateData = req.body;

    if (
      !updateData ||
      typeof updateData !== "object" ||
      Array.isArray(updateData) ||
      Object.keys(updateData).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Update data is required"
      });
    }

    const allowedFields = [
      "name", "email", "age", "phone", "course"
    ];

    const invalidFields = Object.keys(updateData)
      .filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields provided",
        invalidFields
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// ======================================
// 5. DELETE STUDENT
// ======================================
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID"
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student
    });
  } catch (error) {
    return handleError(error, res);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};