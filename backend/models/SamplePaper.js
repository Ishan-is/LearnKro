import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["mcq", "short-answer", "long-answer", "case-study"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    options: [String], // For MCQ type
    correctAnswer: String,
    topic: String,
  },
  { _id: false },
);

const samplePaperSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    syllabusText: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "Sample Paper",
    },
    description: String,
    totalMarks: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 120,
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    questions: [questionSchema],
    sections: [
      {
        sectionName: String,
        instructions: String,
        questionIndices: [Number],
        weightage: { type: Number, default: 0 },
      },
    ],
    instructions: String,
    generatedBy: {
      type: String,
      default: "AI",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SamplePaper", samplePaperSchema);
