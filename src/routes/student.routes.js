const express = require("express");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("../controllers/student.controller");

const { protect } = require(
  "../middleware/auth.middleware"
);

const router = express.Router();

// Protect all Student Routes
router.use(protect);

// CREATE STUDENT
router.post("/", createStudent);

// GET ALL / SEARCH / FILTER / PAGINATION
router.get("/", getAllStudents);

// GET STUDENT BY ID
router.get("/:id", getStudentById);

// UPDATE STUDENT
router.put("/:id", updateStudent);

// DELETE STUDENT
router.delete("/:id", deleteStudent);

module.exports = router;