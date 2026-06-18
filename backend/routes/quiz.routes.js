import express from "express";
import { protect } from "../middleware/auth.js";
import Quiz from "../models/Quiz.js";
import groq, { AI_PROVIDER } from "../config/groqClient.js";

const router = express.Router();

// @desc    Generate a new AI quiz
// @route   POST /api/quiz/generate
// @access  Private
router.post("/generate", protect, async (req, res) => {
  try {
    const { topic, difficulty, totalQuestions, timeLimit } = req.body;

    if (!topic) {
      return res
        .status(400)
        .json({ success: false, message: "Topic is required" });
    }

    const systemPrompt = `You are an expert educational AI assistant that generates multiple-choice quizzes in strict JSON format.
You must return a valid JSON object matching this schema:
{
  "title": "A short engaging title for the quiz",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "${difficulty}"
    }
  ]
}
Notes:
- The "correctAnswer" must be a number (0 to 3) representing the index of the correct option.
- The "options" must be a valid array of exactly 4 strings.
- Return ONLY the JSON object. Do not wrap in markdown or add extra text.`;

    const userPrompt = `Generate a multiple-choice quiz about "${topic}" at a "${difficulty}" difficulty level. Generate exactly ${totalQuestions || 10} questions.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Using a supported fast model
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    let generatedContent = chatCompletion.choices[0]?.message?.content;

    // Clean up response if it contains markdown code blocks
    if (generatedContent.startsWith("```json")) {
      generatedContent = generatedContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    } else if (generatedContent.startsWith("```")) {
      generatedContent = generatedContent.replace(/```/g, "").trim();
    }

    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(generatedContent);
    } catch (e) {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response as JSON: " + e.message);
      }
      parsedQuiz = JSON.parse(jsonMatch[0]);
    }

    // Save to database
    const quiz = await Quiz.create({
      user: req.user.id,
      topic,
      difficulty: difficulty || "medium",
      timeLimit: timeLimit || 15,
      totalQuestions: parsedQuiz.questions.length,
      title: parsedQuiz.title,
      questions: parsedQuiz.questions,
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("Quiz Generation Error (provider: %s):", AI_PROVIDER, error);
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";
    res.status(500).json({
      success: false,
      message:
        "Failed to generate quiz. [provider: " +
        AI_PROVIDER +
        "] " +
        errorMessage,
    });
  }
});

// @desc    Get user's quiz results
// @route   GET /api/quiz/my-results
// @access  Private
router.get("/my-results", protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      user: req.user.id,
      isCompleted: true,
    }).sort({ updatedAt: -1 });

    // Map to expected format for the dashboard
    const results = quizzes.map((q) => ({
      quizId: q._id,
      title: q.title,
      bestScore: q.percentage,
      totalAttempts: 1,
    }));

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get quiz by ID (without answers)
// @route   GET /api/quiz/:quizId
// @access  Private
router.get("/:quizId", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Strip answers if not completed
    if (!quiz.isCompleted) {
      const sanitizedQuiz = quiz.toObject();
      sanitizedQuiz.questions = sanitizedQuiz.questions.map((q) => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
      });
      return res.status(200).json({ success: true, quiz: sanitizedQuiz });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit quiz answers
// @route   POST /api/quiz/:quizId/submit
// @access  Private
router.post("/:quizId/submit", protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    if (quiz.isCompleted) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz already submitted" });
    }

    let score = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) score++;

      results.push({
        question: question.question,
        options: question.options,
        isCorrect,
        correctAnswer: question.correctAnswer,
        yourAnswer: answers[index],
        explanation: question.explanation,
      });
    });

    const percentage = Math.round((score / quiz.totalQuestions) * 100);
    const passed = percentage >= 70; // 70% passing score

    quiz.score = score;
    quiz.percentage = percentage;
    quiz.passed = passed;
    quiz.timeTaken = timeTaken;
    quiz.isCompleted = true;
    quiz.userAnswers = answers;

    await quiz.save();

    res.status(200).json({
      success: true,
      result: {
        score,
        total: quiz.totalQuestions,
        percentage,
        passed,
        timeTaken,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
