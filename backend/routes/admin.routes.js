import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingInstructors = await User.countDocuments({
      role: "instructor",
      instructorApproved: false,
    });
    const approvedInstructors = await User.countDocuments({
      role: "instructor",
      instructorApproved: true,
    });

    // Aggregate users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Aggregate courses by category
    const coursesByCategory = await Course.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Fetch recent signups
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        pendingInstructors,
        approvedInstructors,
        usersByRole,
        coursesByCategory,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get all pending instructor approvals
// @route   GET /api/admin/instructors/pending
// @access  Private/Admin
router.get(
  "/instructors/pending",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const pendingInstructors = await User.find({
        role: "instructor",
        instructorApproved: false,
      }).select("-password");

      res.status(200).json({
        success: true,
        count: pendingInstructors.length,
        instructors: pendingInstructors,
      });
    } catch (error) {
      console.error("Error fetching pending instructors:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Approve instructor
// @route   PUT /api/admin/instructors/:id/approve
// @access  Private/Admin
router.put(
  "/instructors/:id/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }

      if (user.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "User is not an instructor",
        });
      }

      user.instructorApproved = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Instructor approved successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          instructorApproved: user.instructorApproved,
        },
      });
    } catch (error) {
      console.error("Error approving instructor:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Reject instructor
// @route   PUT /api/admin/instructors/:id/reject
// @access  Private/Admin
router.put(
  "/instructors/:id/reject",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }

      if (user.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "User is not an instructor",
        });
      }

      // For now, we'll change role back to student
      user.role = "student";
      await user.save();

      res.status(200).json({
        success: true,
        message: "Instructor rejected",
        reason: reason || "Application rejected by admin",
      });
    } catch (error) {
      console.error("Error rejecting instructor:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Get all users (for admin panel)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password");

    // Transform instructorApproved to isApproved for consistency
    const transformedUsers = users.map((user) => {
      const userObj = user.toObject();
      if (user.role === "instructor") {
        userObj.isApproved = user.instructorApproved;
      }
      return userObj;
    });

    res.status(200).json({
      success: true,
      total: transformedUsers.length,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Approve/Reject instructor
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
router.put(
  "/users/:id/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { approved } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "User is not an instructor",
        });
      }

      user.instructorApproved = approved;
      await user.save();

      res.status(200).json({
        success: true,
        message: approved ? "Instructor approved" : "Instructor rejected",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.instructorApproved,
        },
      });
    } catch (error) {
      console.error("Error approving instructor:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
router.put("/users/:id/ban", protect, authorize("admin"), async (req, res) => {
  try {
    const { banned } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBanned = banned;
    await user.save();

    res.status(200).json({
      success: true,
      message: banned ? "User banned" : "User unbanned",
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get all courses (for admin panel)
// @route   GET /api/admin/courses
// @access  Private/Admin
router.get("/courses", protect, authorize("admin"), async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Toggle publish course
// @route   PUT /api/admin/courses/:id/publish
// @access  Private/Admin
router.put("/courses/:id/publish", protect, authorize("admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.isPublished = !course.isPublished;
    course.status = course.isPublished ? "published" : "draft";
    await course.save();

    res.status(200).json({
      success: true,
      message: course.isPublished ? "Course published successfully" : "Course unpublished successfully",
      course,
    });
  } catch (error) {
    console.error("Error toggling course publish status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put("/users/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow an admin to change their own role to prevent lockout
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    // If promoted to instructor, auto-approve them
    if (role === "instructor") {
      user.instructorApproved = true;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create a new admin
// @route   POST /api/admin/users/create-admin
// @access  Private/Admin
router.post("/users/create-admin", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      role: "admin",
      isVerified: true, // Auto-verified
    });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
