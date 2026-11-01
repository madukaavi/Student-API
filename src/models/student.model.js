const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email"
      ]
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [16, "Minimum age is 16"]
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true
    },

    // Legacy course name
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true
    },

    // New MongoDB Reference
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model(
  "Student",
  studentSchema
);

module.exports = Student;