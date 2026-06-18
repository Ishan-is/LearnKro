import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const router = express.Router();

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate("course", "title thumbnail category instructor")
      .sort("-updatedAt");

    res.status(200).json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:courseId
// @access  Private
router.get("/check/:courseId", protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    res.status(200).json({ success: true, isEnrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get specific course enrollment details
// @route   GET /api/enrollments/course/:courseId
// @access  Private
router.get("/course/:courseId", protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    res.status(200).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
router.post("/:courseId", protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check if already enrolled in the new Enrollment model
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    // Create Enrollment document
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      currentLecture: 0,
      completedLectures: [],
      completionPercentage: 0,
      isCompleted: false,
      pricePaid: course.price || 0,
    });

    // Fallback/Legacy arrays
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }
    
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    res.status(201).json({ success: true, message: "Enrolled successfully", enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
router.put("/:id/progress", protect, async (req, res) => {
  try {
    const { currentLecture, completedLectures, completionPercentage, isCompleted } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    if (currentLecture !== undefined) enrollment.currentLecture = currentLecture;
    if (completedLectures !== undefined) enrollment.completedLectures = completedLectures;
    if (completionPercentage !== undefined) enrollment.completionPercentage = completionPercentage;
    if (isCompleted !== undefined) enrollment.isCompleted = isCompleted;

    await enrollment.save();

    res.status(200).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
