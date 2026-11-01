require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Student = require("./models/student.model");

const testStudent = async () => {
  try {
    // Step 1: Connect MongoDB
    await connectDB();

    // Step 2: Create Student Document
    const student = new Student({
      name: "Kamal Perera",
      email: "kamal@gmail.com",
      age: 22,
      phone: "0771234567",
      course: "MERN Stack"
    });

    // Step 3: Save Student
    const savedStudent = await student.save();

    console.log("Student Saved Successfully!");
    console.log(savedStudent);

  } catch (error) {
    console.error("Error:", error.message);

  } finally {
    await mongoose.disconnect();
  }
};

testStudent();