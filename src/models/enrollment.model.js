const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"]
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"]
    },

    status: {
      type: String,
      enum: [
        "active",
        "completed",
        "cancelled"
      ],
      default: "active"
    },

    enrolledAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent same student + course duplicate
enrollmentSchema.index(
  {
    studentId: 1,
    courseId: 1
  },
  {
    unique: true
  }
);

// Helpful indexes for list queries
enrollmentSchema.index({
  courseId: 1,
  status: 1
});

const Enrollment = mongoose.model(
  "Enrollment",
  enrollmentSchema
);

module.exports = Enrollment;