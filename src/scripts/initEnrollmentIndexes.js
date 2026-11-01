require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Enrollment = require(
  "../models/enrollment.model"
);

const initializeIndexes = async () => {
  try {
    await connectDB();

    await Enrollment.createIndexes();

    console.log("Enrollment indexes ready");

    const indexes = await Enrollment.collection.indexes();

    console.log(indexes);

  } catch (error) {
    console.error("Index setup failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

initializeIndexes();