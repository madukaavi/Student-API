const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: [true, "Enrollment ID is required"]
    },

    date: {
      type: String,
      required: [true, "Class date is required"],
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date must be YYYY-MM-DD"
      ]
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      required: [true, "Attendance status is required"]
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// One record per enrollment per class date
attendanceSchema.index(
  { enrollmentId: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

module.exports = Attendance;