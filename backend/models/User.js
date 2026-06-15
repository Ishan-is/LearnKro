import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    instructorApproved: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
// folder
//   backend
//      config
//        cloudinary.js
//        db.js
//      middleware
//        auth.js
//      models
//        course.js
//        user.js
//      node_modules
//      routes
//        admin.routes.js
//        auth.routes.js
//        course.routes.js
//      .env
//      package-lock.json
//      package.json
//      seed.js
//      server.js
//   frontend
//      node_modules
//      src
//        components
//          chatbot
//          course
//          layout
//        context
//          authStore.js
//        pages
//          admin
//            AdminDashboard.jsx
//            AdminCoursesPage.jsx
//            AdminUsersPage.jsx
//          auth
//            LoginPage.jsx
//            RegisterPage.jsx
//          instructor
//            CreateCoursePage.jsx
//            InstructorDashboard.jsx
//            InstructorCoursesPage.jsx
//            InstructorStudentsPage.jsx
//            ManageCoursePage.jsx
//          student
//            CourseDetailsPage.jsx
//            CoursesPage.jsx
//            HomePage.jsx
//          CourseDetailsPage.jsx
//          CoursesPage.jsx
//          HomePage.jsx
//        utils
//        App.jsx
//        index.css
//        main.jsx
//      .env
//      index.html
//      package-lock.json
//      package.json
//      postcss.config.js
//      tailwind.config.js
//      vite.config.js
//   package.json
//   README.md


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);
