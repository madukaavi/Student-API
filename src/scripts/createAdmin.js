require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Admin = require("../models/admin.model");

const createAdmin = async () => {
  try {
    const [name, rawEmail, password] =
      process.argv.slice(2);

    if (
      !name ||
      !rawEmail ||
      !password ||
      password.length < 12 ||
      password.length > 72
    ) {
      throw new Error(
        "Provide name, email and password (12-72 chars)"
      );
    }

    const email = rawEmail.trim().toLowerCase();

    await connectDB();

    const existingAdmin = await Admin.findOne({
      email
    });

    if (existingAdmin) {
      throw new Error("Admin already exists");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully");

  } catch (error) {
    console.error("Create Admin Error:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();