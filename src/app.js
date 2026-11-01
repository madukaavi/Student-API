const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require(
  "./routes/enrollment.routes"
);
const attendanceRoutes = require(
  "./routes/attendance.routes"
);

const app = express();

// ====================================
// GLOBAL MIDDLEWARE
// ====================================
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Request Logger
app.use((req, res, next) => {
  console.log(
    "Incoming Request:",
    req.method,
    req.originalUrl
  );
  next();
});

// ====================================
// HEALTH CHECK
// ====================================
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Student Management API Running"
  });
});

// ====================================
// AUTH ROUTES
// ====================================
app.use("/api/auth", authRoutes);

// ====================================
// STUDENT ROUTES
// ====================================
app.use("/api/students", studentRoutes);

// ====================================
// COURSE ROUTES
// ====================================
app.use("/api/courses", courseRoutes);

// ====================================
// ENROLLMENT ROUTES
// ====================================
app.use("/api/enrollments", enrollmentRoutes);

// ====================================
// ATTENDANCE ROUTES
// ====================================
app.use("/api/attendance", attendanceRoutes);

// ====================================
// 404 HANDLER
// ====================================
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ====================================
// GLOBAL ERROR HANDLER
// ====================================
app.use((err, req, res, next) => {
  if (
    err.status === 400 &&
    err.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body"
    });
  }

  if (err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Request body too large"
    });
  }

  console.error("Server Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

module.exports = app;