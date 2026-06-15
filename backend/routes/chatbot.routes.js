import express from "express";
import { protect } from "../middleware/auth.js";
import groq, { AI_PROVIDER } from "../config/groqClient.js";

const router = express.Router();

// @desc    Chat with AI
// @route   POST /api/chatbot
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid messages array is required" });
    }

    // Prepare messages for Groq API
    const formattedMessages = [
      {
        role: "system",
        content:
          "You are a helpful and knowledgeable AI learning assistant for an educational platform called LearnKro. You provide clear, concise, and educational answers to students. You can answer general knowledge queries based on your extensive training data, acting as a conversational web proxy.",
      },
      ...messages.map((msg) => ({
        role: msg.user ? "user" : "assistant",
        content: msg.text,
      })),
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.1-8b-instant", // Using a supported fast model
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText =
      chatCompletion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    console.error("Chatbot Error (provider: %s):", AI_PROVIDER, error);
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";
    res.status(500).json({
      success: false,
      message:
        "Chatbot failed to respond. [provider: " +
        AI_PROVIDER +
        "] " +
        errorMessage,
    });
  }
});

export default router;
