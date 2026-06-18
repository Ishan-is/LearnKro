import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, required: true },
        difficulty: { type: String, enum: ["easy", "medium", "hard"] },
      },
    ],
    score: {
      type: Number,
      default: null,
    },
    percentage: {
      type: Number,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
    },
    timeTaken: {
      type: Number,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    userAnswers: [
      {
        type: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quiz", quizSchema);
