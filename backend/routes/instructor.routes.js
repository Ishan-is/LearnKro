import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const router = express.Router();

// @desc    Get instructor stats
// @route   GET /api/instructor/stats
// @access  Private/Instructor
router.get(
  "/stats",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const instructorId = req.user.id;

      // Find all courses created by this instructor
      const courses = await Course.find({ instructor: instructorId });

      const totalCourses = courses.length;

      // Sum all enrolled students across all courses
      const totalEnrollments = courses.reduce(
        (sum, c) => sum + (c.enrolledStudents?.length || 0),
        0
      );

      // Find unique student count
      const uniqueStudentIds = new Set();
      courses.forEach((c) => {
        c.enrolledStudents?.forEach((sId) => {
          uniqueStudentIds.add(sId.toString());
        });
      });
      const totalStudents = uniqueStudentIds.size;

      // Calculate total revenue by summing pricePaid of all enrollments for these courses
      const courseIds = courses.map((c) => c._id);
      const enrollments = await Enrollment.find({ course: { $in: courseIds } });
      const totalRevenue = enrollments.reduce(
        (sum, e) => sum + (e.pricePaid || 0),
        0
      );

      res.status(200).json({
        success: true,
        stats: {
          totalCourses,
          totalStudents,
          totalEnrollments,
          totalRevenue,
        },
      });
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error",
      });
    }
  }
);

// @desc    Get instructor students/enrollments
// @route   GET /api/instructor/students
// @access  Private/Instructor
router.get(
  "/students",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const instructorId = req.user.id;

      // Find courses of this instructor
      const courses = await Course.find({ instructor: instructorId }).select("_id");
      const courseIds = courses.map((c) => c._id);

      // Find enrollments for these courses
      const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate("user", "name email avatar")
        .populate("course", "title")
        .sort("-createdAt");

      // Map "user" to "student" for frontend compatibility
      const mappedEnrollments = enrollments.map((e) => {
        const obj = e.toObject();
        obj.student = obj.user; // alias user as student
        return obj;
      });

      res.status(200).json({
        success: true,
        enrollments: mappedEnrollments,
      });
    } catch (error) {
      console.error("Error fetching instructor students:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error",
      });
    }
  }
);

export default router;
