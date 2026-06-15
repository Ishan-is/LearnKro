import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create order
router.post("/create-order/:courseId", protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.isFree || course.price === 0) return res.status(400).json({ message: "Course is free" });

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, CLIENT_URL } = process.env;
    // Mock mode if keys missing
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_ID.includes("your_razorpay_key_id")) {
      const mockToken = `mock_${Date.now()}_${courseId}_${userId}`;
      const mockUrl = `${CLIENT_URL}/payment/success?mock=true&orderId=${mockToken}&courseId=${courseId}`;
      return res.json({ url: mockUrl, mock: true });
    }
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const amount = course.price * 100; // rupees to paise
    const order = await instance.orders.create({ amount, currency: "INR", receipt: `receipt_${Date.now()}` });
    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
      courseTitle: course.title,
      mock: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify payment
router.post("/verify", protect, async (req, res) => {
  try {
    const { mock, orderId, payment_id, signature, courseId } = req.body;
    const userId = req.user.id;
    if (mock) {
      // token format: mock_timestamp_courseId_userId
      const parts = orderId.split("_");
      if (parts.length !== 4) return res.status(400).json({ message: "Invalid mock token" });
      const [, , tokenCourseId, tokenUserId] = parts;
      if (tokenUserId !== userId) return res.status(403).json({ message: "User mismatch" });
      // Enroll user
      const existing = await Enrollment.findOne({ user: userId, course: tokenCourseId });
      if (existing) return res.json({ success: true, message: "Already enrolled" });
      await Enrollment.create({ user: userId, course: tokenCourseId });
      await Course.findByIdAndUpdate(tokenCourseId, { $push: { enrolledStudents: userId } });
      return res.json({ success: true });
    }
    const { RAZORPAY_KEY_SECRET } = process.env;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${payment_id}`)
      .digest("hex");
    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }
    // Enroll the user to the course.
    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) return res.json({ success: true, message: "Already enrolled" });
    await Enrollment.create({ user: userId, course: courseId });
    await Course.findByIdAndUpdate(courseId, { $push: { enrolledStudents: userId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
