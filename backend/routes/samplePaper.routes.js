import express from "express";
import { protect } from "../middleware/auth.js";
import SamplePaper from "../models/SamplePaper.js";
import groq, { AI_PROVIDER } from "../config/groqClient.js";

const router = express.Router();

// @desc    Generate a sample paper from syllabus
// @route   POST /api/sample-paper/generate
// @access  Private
router.post("/generate", protect, async (req, res) => {
  try {
    const {
      subject,
      syllabusText,
      totalMarks = 100,
      duration = 120,
      difficultyLevel = "mixed",
      customSections,
    } = req.body;

    if (!subject || !syllabusText) {
      return res
        .status(400)
        .json({ success: false, message: "Missing subject or syllabus text" });
    }

    const systemPrompt = `You are an expert exam paper creator that generates comprehensive sample papers in strict JSON format.
You must return a valid JSON object matching this schema:
{
  "title": "Sample Paper - [Subject Name]",
  "description": "A comprehensive sample paper for [Subject]",
  "instructions": "General exam instructions here",
  "sections": [
    {
      "sectionName": "Section A: Multiple Choice Questions",
      "instructions": "Answer all questions. Each question carries 1 mark.",
      "questionIndices": [1, 2]
    }
  ],
  "questions": [
    {
      "questionNumber": 1,
      "question": "The question text here?",
      "questionType": "mcq | short-answer | long-answer | case-study",
      "difficulty": "easy | medium | hard",
      "marks": 1,
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "topic": "Topic name"
    }
  ]
}
Notes:
- "options" should be an array of strings (only required for 'mcq' type, otherwise empty array).
- "correctAnswer" is the text value of the correct option for 'mcq', or a brief key marking scheme for other types.
- "questionIndices" in sections must map to the "questionNumber" in the questions list.
- The "sections" array in the JSON response must correspond exactly to the requested section structure, using the requested section names if custom sections are provided.
- Return ONLY the JSON object. Do not wrap in markdown or add extra text.`;

    let sectionInstructions = "";
    if (customSections && Array.isArray(customSections) && customSections.length > 0) {
      sectionInstructions = `Generate exactly the following sections with their respective weightages and question types:
${customSections
  .map((sec, idx) => {
    const name = sec.sectionName || `Section ${String.fromCharCode(65 + idx)}`;
    const type = sec.questionType || "mixed";
    const weightage = sec.weightage || 0;
    const qCount = sec.questionsCount ? `, containing exactly ${sec.questionsCount} questions` : "";
    return `- ${name}: Question Type: ${type}, Weightage: ${weightage} marks${qCount}`;
  })
  .join("\n")}

CRITICAL INSTRUCTIONS for sections:
1. The returned JSON "sections" array must have exactly these ${customSections.length} section objects in the same order.
2. In each section object, set "sectionName" to the requested section name exactly (e.g. "${customSections[0]?.sectionName || 'Section A'}").
3. Ensure the sum of marks of all questions in each section matches the requested section weightage exactly.
4. If a question count was specified for a section, generate exactly that number of questions for it.`;
    } else {
      sectionInstructions = `Generate diverse question types:
- Multiple Choice Questions (MCQ) - 20% of marks
- Short Answer Questions - 30% of marks
- Long Answer Questions - 40% of marks
- Case Study Questions - 10% of marks`;
    }

    const userPrompt = `Create a comprehensive sample paper based on the following:
Subject: ${subject}
Syllabus: ${syllabusText}
Total Marks: ${totalMarks}
Duration: ${duration} minutes
Difficulty Level: ${difficultyLevel}

${sectionInstructions}`;

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
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
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

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      // Try to extract JSON from the response
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response as JSON");
      }
      parsedContent = JSON.parse(jsonMatch[0]);
    }

    const typeMapping = {
      "mcq": "mcq",
      "short": "short-answer",
      "short-answer": "short-answer",
      "long": "long-answer",
      "long-answer": "long-answer",
      "case_study": "case-study",
      "case-study": "case-study"
    };

    const sanitizedQuestions = (parsedContent.questions || []).map(q => ({
      ...q,
      questionType: typeMapping[q.questionType] || "short-answer"
    }));

    const samplePaper = await SamplePaper.create({
      user: req.user.id,
      subject,
      syllabusText,
      title: parsedContent.title || `Sample Paper - ${subject}`,
      description: parsedContent.description,
      totalMarks,
      duration,
      difficultyLevel,
      instructions: parsedContent.instructions,
      questions: sanitizedQuestions,
      sections: parsedContent.sections || [],
      generatedBy: "AI",
    });

    res.status(201).json({ success: true, samplePaper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Save a generated sample paper
// @route   POST /api/sample-paper
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const {
      subject,
      title,
      description,
      questions,
      totalMarks,
      duration,
      difficultyLevel,
      sections,
      instructions,
    } = req.body;

    if (!subject || !questions) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const samplePaper = await SamplePaper.create({
      user: req.user.id,
      subject,
      syllabusText: "",
      title: title || `Sample Paper - ${subject}`,
      description,
      totalMarks: totalMarks || 100,
      duration: duration || 120,
      difficultyLevel: difficultyLevel || "mixed",
      questions,
      sections: sections || [],
      instructions,
      generatedBy: "Manual",
    });

    res.status(201).json({ success: true, samplePaper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all sample papers for the current user
// @route   GET /api/sample-paper/my
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const samplePapers = await SamplePaper.find({ user: req.user.id }).sort(
      "-createdAt",
    );
    res.status(200).json({ success: true, samplePapers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a specific sample paper
// @route   GET /api/sample-paper/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const samplePaper = await SamplePaper.findById(req.params.id);

    if (!samplePaper) {
      return res
        .status(404)
        .json({ success: false, message: "Sample paper not found" });
    }

    // Check ownership
    if (samplePaper.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this paper" });
    }

    res.status(200).json({ success: true, samplePaper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a sample paper
// @route   PUT /api/sample-paper/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const samplePaper = await SamplePaper.findById(req.params.id);

    if (!samplePaper) {
      return res
        .status(404)
        .json({ success: false, message: "Sample paper not found" });
    }

    // Check ownership
    if (samplePaper.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this paper",
      });
    }

    const updatedPaper = await SamplePaper.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, samplePaper: updatedPaper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a sample paper
// @route   DELETE /api/sample-paper/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const samplePaper = await SamplePaper.findById(req.params.id);

    if (!samplePaper) {
      return res
        .status(404)
        .json({ success: false, message: "Sample paper not found" });
    }

    // Check ownership
    if (samplePaper.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this paper",
      });
    }

    await SamplePaper.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Sample paper deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
