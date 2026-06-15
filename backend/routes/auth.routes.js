import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      isVerified: false,
      otp,
      otpExpire,
    });

    // Send verification email
    const subject = "LearnKro AI - Email Verification OTP";
    const message = `Welcome to LearnKro AI, ${user.name}! Your verification OTP is: ${otp}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">LearnKro AI Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering at LearnKro AI. Please verify your email address by using the OTP below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #1f2937; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({ email: user.email, subject, message, html });

    res.status(201).json({
      success: true,
      message: "Verification OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP and resend
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();

      const subject = "LearnKro AI - Email Verification OTP";
      const message = `Please verify your email address. Your verification OTP is: ${otp}. It is valid for 10 minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">LearnKro AI Verification Required</h2>
          <p>Hello ${user.name},</p>
          <p>Your account is not yet verified. Please verify your email address using the OTP below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #1f2937; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
        </div>
      `;

      await sendEmail({ email: user.email, subject, message, html });

      return res.status(403).json({
        success: false,
        isNotVerified: true,
        message: "Your email is not verified. A new OTP has been sent to your email.",
        email: user.email,
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.instructorApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @desc    Verify email OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpire");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Set user verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.instructorApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
});

// @desc    Resend email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    const subject = "LearnKro AI - Email Verification OTP";
    const message = `Your new verification OTP is: ${otp}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">LearnKro AI Verification OTP Resent</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a new verification OTP. Please verify your email address by using the OTP below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #1f2937; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      </div>
    `;

    await sendEmail({ email: user.email, subject, message, html });

    res.status(200).json({
      success: true,
      message: "Verification OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "There is no user with that email",
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    console.log("🔑 [Forgot Password] Email:", req.body.email);
    console.log("🔑 [Forgot Password] Generated raw resetToken:", resetToken);
    console.log("🔑 [Forgot Password] Hashed token saved in DB:", user.resetPasswordToken);
    console.log("🔑 [Forgot Password] Expiration saved in DB:", user.resetPasswordExpire);

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const subject = "LearnKro AI - Password Reset Link";
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please verify here:\n\n ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">LearnKro AI Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `;

    const emailSent = await sendEmail({
      email: user.email,
      subject,
      message,
      html,
    });

    if (!emailSent) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: "Email sent with reset instructions",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put("/reset-password/:resettoken", async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    console.log("🔄 [Reset Password] Received raw param resettoken:", req.params.resettoken);
    console.log("🔄 [Reset Password] Derived hashed token:", resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      // Find user without expiry check for better debugging
      const debugUser = await User.findOne({ resetPasswordToken });
      if (debugUser) {
        console.log("🔄 [Reset Password] Match found but expired. Expire time:", debugUser.resetPasswordExpire, "Current time:", new Date());
      } else {
        console.log("🔄 [Reset Password] No user found with this hashed token in the database.");
      }

      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.log("🔄 [Reset Password] User found:", user.email);

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.instructorApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isApproved: user.instructorApproved,
        enrolledCourses: user.enrolledCourses,
        createdCourses: user.createdCourses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
