import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import courseRoutes from "./routes/course.routes.js";
import samplePaperRoutes from "./routes/samplePaper.routes.js";
// import userRoutes from "./routes/user.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
// import instructorRoutes from "./routes/instructor.routes.js";

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or 127.0.0.1 on any port, or no origin (like mobile/postman)
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Check if the origin matches the configured CLIENT_URL (ignoring trailing slash)
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, "") === cleanOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sample-paper", samplePaperRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/payments", paymentRoutes);
// app.use("/api/instructor", instructorRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running and MongoDB is connected!" });
});

// Health check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  res.json({
    status: "OK",
    message: "LearnKro API is running",
    database: states[dbState] || "unknown",
    mongoUriConfigured: !!process.env.MONGO_URI,
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Only start listener if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 LearnKro server running on port ${PORT}`);
  });
}

export default app;
