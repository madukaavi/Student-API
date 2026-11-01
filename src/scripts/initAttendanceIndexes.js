require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Attendance = require(
  "../models/attendance.model"
);

const initialize = async () => {
  try {
    await connectDB();

    await Attendance.createIndexes();

    console.log("Attendance indexes ready");

    const indexes =
      await Attendance.collection.indexes();

    console.log(indexes);

  } catch (error) {
    console.error(
      "Index setup failed:",
      error.message
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

initialize();