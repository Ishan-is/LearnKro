import express from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  uploadToCloudinary,
  uploadVideo,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

const router = express.Router();

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Instructor
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        level,
        price,
        isFree,
        language,
        tags,
        requirements,
        learningOutcomes,
      } = req.body;

      // Validate required fields
      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message: "Please provide title, description, and category",
        });
      }

      // Parse JSON arrays if they come as strings
      const parsedTags =
        typeof tags === "string" ? JSON.parse(tags) : tags || [];
      const parsedRequirements =
        typeof requirements === "string"
          ? JSON.parse(requirements)
          : requirements || [];
      const parsedOutcomes =
        typeof learningOutcomes === "string"
          ? JSON.parse(learningOutcomes)
          : learningOutcomes || [];

      // Create course object
      const courseData = {
        title,
        description,
        category,
        level: level || "Beginner",
        price: price || 0,
        isFree: isFree === "true" || isFree === true,
        language: language || "English",
        tags: parsedTags,
        requirements: parsedRequirements,
        learningOutcomes: parsedOutcomes,
        instructor: req.user.id,
      };

      // Handle thumbnail upload
      if (req.files && req.files.thumbnail) {
        try {
          const uploadResult = await uploadToCloudinary(
            req.files.thumbnail,
            "learnkro/thumbnails",
          );
          courseData.thumbnail = uploadResult.url;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Thumbnail upload failed: ${error.message}`,
          });
        }
      }

      // Create course
      const course = await Course.create(courseData);

      // Add course to instructor's createdCourses
      await User.findByIdAndUpdate(req.user.id, {
        $push: { createdCourses: course._id },
      });

      // Populate instructor info
      await course.populate("instructor", "name email avatar");

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  },
);

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, level, search, sort, page = 1, limit = 12 } = req.query;
    let query = { isPublished: true };

    if (category && category !== "All") query.category = category;
    if (level && level !== "All") query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Exclude courses from banned instructors
    const bannedInstructors = await User.find({ isBanned: true }).select("_id");
    const bannedIds = bannedInstructors.map((u) => u._id);
    query.instructor = { $nin: bannedIds };

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Course.countDocuments(query);
    const pages = Math.ceil(total / parsedLimit);

    let courses;
    if (sort === "-enrolledStudents") {
      const coursesAgg = await Course.aggregate([
        { $match: query },
        { $addFields: { enrolledCount: { $size: { $ifNull: [ "$enrolledStudents", [] ] } } } },
        { $sort: { enrolledCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parsedLimit },
        { $project: { modules: 0 } }
      ]);
      
      courses = await Course.populate(coursesAgg, [
        { path: "instructor", select: "name email avatar" }
      ]);
    } else {
      let sortObj = { createdAt: -1 };
      if (sort === "price") {
        sortObj = { price: 1, createdAt: -1 };
      } else if (sort === "-price") {
        sortObj = { price: -1, createdAt: -1 };
      } else if (sort === "-averageRating") {
        sortObj = { averageRating: -1, createdAt: -1 };
      } else if (sort === "-createdAt") {
        sortObj = { createdAt: -1 };
      }

      courses = await Course.find(query)
        .populate("instructor", "name email avatar")
        .select("-modules")
        .sort(sortObj)
        .skip(skip)
        .limit(parsedLimit);
    }

    res.status(200).json({
      success: true,
      courses,
      pagination: {
        total,
        page: parsedPage,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// @desc    Get courses created by instructor
// @route   GET /api/courses/instructor/my-courses
// @access  Private/Instructor
router.get(
  "/instructor/my-courses",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.user.id }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        total: courses.length,
        courses,
      });
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar bio isBanned")
      .populate("enrolledStudents", "name email avatar")
      .populate("ratings.user", "name email avatar");

    if (!course || (course.instructor && course.instructor.isBanned)) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      let course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if user is instructor or admin
      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this course",
        });
      }

      // Parse JSON arrays if they come as strings
      const { tags, requirements, learningOutcomes } = req.body;
      if (tags && typeof tags === "string") {
        req.body.tags = JSON.parse(tags);
      }
      if (requirements && typeof requirements === "string") {
        req.body.requirements = JSON.parse(requirements);
      }
      if (learningOutcomes && typeof learningOutcomes === "string") {
        req.body.learningOutcomes = JSON.parse(learningOutcomes);
      }

      // Handle thumbnail update
      if (req.files && req.files.thumbnail) {
        // Delete old thumbnail if exists
        if (course.thumbnail) {
          const publicId = course.thumbnail
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];
          await deleteFromCloudinary(publicId, "image");
        }

        try {
          const uploadResult = await uploadToCloudinary(
            req.files.thumbnail,
            "learnkro/thumbnails",
          );
          req.body.thumbnail = uploadResult.url;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Thumbnail upload failed: ${error.message}`,
          });
        }
      }

      course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course,
      });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  },
);

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if user is instructor or admin
      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this course",
        });
      }

      // Delete thumbnail from Cloudinary if exists
      if (course.thumbnail) {
        const publicId = course.thumbnail
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await deleteFromCloudinary(publicId, "image");
      }

      await Course.findByIdAndDelete(req.params.id);

      // Delete all enrollments associated with this course
      await Enrollment.deleteMany({ course: req.params.id });

      // Remove course from instructor's createdCourses
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { createdCourses: req.params.id },
      });

      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Add a section
// @route   POST /api/courses/:id/sections
// @access  Private/Instructor
router.post(
  "/:id/sections",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const { title } = req.body;
      if (!title) return res.status(400).json({ success: false, message: "Title is required" });

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      course.sections.push({ title, lectures: [] });
      await course.save();

      res.status(201).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Update a section
// @route   PUT /api/courses/:id/sections/:sectionId
// @access  Private/Instructor
router.put(
  "/:id/sections/:sectionId",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const { title } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const section = course.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });

      if (title) section.title = title;
      await course.save();

      res.status(200).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Delete a section
// @route   DELETE /api/courses/:id/sections/:sectionId
// @access  Private/Instructor
router.delete(
  "/:id/sections/:sectionId",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      course.sections.pull({ _id: req.params.sectionId });
      await course.save();

      res.status(200).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Add a lecture
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private/Instructor
router.post(
  "/:id/sections/:sectionId/lectures",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const { title, description, content, duration, lectureType } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const section = course.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });

      const newLecture = {
        title,
        description,
        content,
        duration,
        lectureType: lectureType || "video"
      };

      if (req.files && req.files.video) {
        try {
          const uploadResult = await uploadVideo(req.files.video);
          newLecture.video = { url: uploadResult.url, public_id: uploadResult.publicId };
        } catch (error) {
          return res.status(400).json({ success: false, message: `Video upload failed: ${error.message}` });
        }
      }

      if (req.files && req.files.asset) {
        try {
          const uploadResult = await uploadToCloudinary(req.files.asset, "learnkro/assets");
          newLecture.asset = { url: uploadResult.url, public_id: uploadResult.publicId };
        } catch (error) {
          return res.status(400).json({ success: false, message: `Asset upload failed: ${error.message}` });
        }
      }

      section.lectures.push(newLecture);
      await course.save();

      res.status(201).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Update a lecture
// @route   PUT /api/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private/Instructor
router.put(
  "/:id/sections/:sectionId/lectures/:lectureId",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const { title, description, content, duration, lectureType } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const section = course.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });

      const lecture = section.lectures.id(req.params.lectureId);
      if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

      if (title) lecture.title = title;
      if (description !== undefined) lecture.description = description;
      if (content !== undefined) lecture.content = content;
      if (duration !== undefined) lecture.duration = duration;
      if (lectureType !== undefined) lecture.lectureType = lectureType;

      if (req.files && req.files.video) {
        if (lecture.video && lecture.video.public_id) {
          await deleteFromCloudinary(lecture.video.public_id, "video");
        }
        try {
          const uploadResult = await uploadVideo(req.files.video);
          lecture.video = { url: uploadResult.url, public_id: uploadResult.publicId };
        } catch (error) {
          return res.status(400).json({ success: false, message: `Video upload failed: ${error.message}` });
        }
      }

      if (req.files && req.files.asset) {
        if (lecture.asset && lecture.asset.public_id) {
          await deleteFromCloudinary(lecture.asset.public_id, "image");
        }
        try {
          const uploadResult = await uploadToCloudinary(req.files.asset, "learnkro/assets");
          lecture.asset = { url: uploadResult.url, public_id: uploadResult.publicId };
        } catch (error) {
          return res.status(400).json({ success: false, message: `Asset upload failed: ${error.message}` });
        }
      }

      await course.save();
      res.status(200).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Delete a lecture
// @route   DELETE /api/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private/Instructor
router.delete(
  "/:id/sections/:sectionId/lectures/:lectureId",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const section = course.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });

      const lecture = section.lectures.id(req.params.lectureId);
      if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

      if (lecture.video && lecture.video.public_id) {
        await deleteFromCloudinary(lecture.video.public_id, "video");
      }

      if (lecture.asset && lecture.asset.public_id) {
        await deleteFromCloudinary(lecture.asset.public_id, "image");
      }

      section.lectures.pull({ _id: req.params.lectureId });
      await course.save();

      res.status(200).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @desc    Add or update course rating/review
// @route   POST /api/courses/:id/ratings
// @access  Private
router.post("/:id/ratings", protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating between 1 and 5",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled (via Course or Enrollment model)
    const isEnrolledInCourse = course.enrolledStudents.includes(userId);
    const enrollment = await req.app.get("db") ? null : await mongoose.model("Enrollment").findOne({ user: userId, course: courseId });
    
    if (!isEnrolledInCourse && !enrollment) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can rate this course",
      });
    }

    // Check if already rated
    const existingRatingIndex = course.ratings.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
      course.ratings[existingRatingIndex].review = review || "";
      course.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
      // Add new rating
      course.ratings.push({
        user: userId,
        rating,
        review: review || "",
      });
    }

    // Calculate average rating
    const totalRatings = course.ratings.length;
    const sumRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    course.totalRatings = totalRatings;
    course.averageRating = averageRating;
    course.rating = averageRating; // set legacy rating field to the same value

    await course.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      averageRating,
      totalRatings,
      ratings: course.ratings,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

export default router;
