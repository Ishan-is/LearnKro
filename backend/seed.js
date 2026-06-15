import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Check if demo users already exist
    const existingStudent = await User.findOne({ email: "student@demo.com" });
    const existingInstructor = await User.findOne({
      email: "instructor@demo.com",
    });
    const existingAdmin = await User.findOne({ email: "admin@demo.com" });

    if (existingStudent) {
      console.log("Demo student already exists");
    } else {
      await User.create({
        name: "Demo Student",
        email: "student@demo.com",
        password: "password123",
        role: "student",
        isVerified: true,
      });
      console.log("Demo student created");
    }

    if (existingInstructor) {
      console.log("Demo instructor already exists");
    } else {
      await User.create({
        name: "Demo Instructor",
        email: "instructor@demo.com",
        password: "password123",
        role: "instructor",
        instructorApproved: true,
        isVerified: true,
      });
      console.log("Demo instructor created");
    }

    if (existingAdmin) {
      console.log("Demo admin already exists");
    } else {
      await User.create({
        name: "Demo Admin",
        email: "admin@demo.com",
        password: "password123",
        role: "admin",
        isVerified: true,
      });
      console.log("Demo admin created");
    }

    console.log("Seeding completed!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedUsers();
