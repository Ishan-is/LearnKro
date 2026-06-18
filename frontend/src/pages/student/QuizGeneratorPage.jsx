import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function QuizGeneratorPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);

  const { data: myCourses } = useQuery({
    queryKey: ["my-enrolled-courses"],
    queryFn: () =>
      api
        .get("/enrollments/my")
        .then((r) => r.data.enrollments.map((e) => e.course)),
  });

  const { data: quizHistory } = useQuery({
    queryKey: ["my-quiz-history"],
    queryFn: () => api.get("/quiz/my-results").then((r) => r.data.results),
  });

  const generateQuizMutation = useMutation({
    mutationFn: (data) =>
      api.post("/quiz/generate", data).then((r) => r.data.quiz),
    onSuccess: (quiz) => {
      toast.success("Quiz generated successfully!");
      navigate(`/quiz/${quiz._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    generateQuizMutation.mutate({
      topic: topic.trim(),
      difficulty,
      totalQuestions: questionCount,
      timeLimit,
    });
  };

  const quickTopics = [
    "JavaScript Fundamentals",
    "React Basics",
    "Python Programming",
    "Data Structures",
    "Web Development",
    "Machine Learning",
    "Database Design",
    "API Development",
  ];

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-600/30">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            AI Quiz <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Generate personalized quizzes powered by AI to test your knowledge
            and ace your exams
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quiz Generator Form */}
          <div className="lg:col-span-2">
            <div className="card p-8 shadow-xl">
              <h2 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Generate New Quiz
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Fill in the details below and let AI create a custom quiz for
                you
              </p>

              <div className="space-y-7">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Topic or Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., JavaScript Arrays, React Hooks, Python Classes..."
                    className="input text-base"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-4">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        value: "easy",
                        label: "Easy",
                        color: "from-emerald-500 to-green-600",
                        icon: "🟢",
                      },
                      {
                        value: "medium",
                        label: "Medium",
                        color: "from-amber-500 to-orange-600",
                        icon: "🟡",
                      },
                      {
                        value: "hard",
                        label: "Hard",
                        color: "from-rose-500 to-red-600",
                        icon: "🔴",
                      },
                    ].map(({ value, label, color, icon }) => (
                      <button
                        key={value}
                        onClick={() => setDifficulty(value)}
                        className={`p-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                          difficulty === value
                            ? `border-white/30 bg-gradient-to-br ${color} text-white shadow-lg shadow-current/30 scale-105`
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <span className="text-lg mr-2">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="input text-base"
                  >
                    {[5, 10, 15, 20, 25].map((num) => (
                      <option key={num} value={num}>
                        {num} questions
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Time Limit (minutes)
                  </label>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="input text-base"
                  >
                    {[5, 10, 15, 20, 30, 45, 60].map((min) => (
                      <option key={min} value={min}>
                        {min} minutes
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generateQuizMutation.isPending}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-8 text-lg py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generateQuizMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quiz History */}
            {quizHistory?.length > 0 && (
              <div className="card p-8 shadow-xl mt-6">
                <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary-400" />
                  Quiz History & Analysis
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Review your past quiz attempts and detailed answers
                </p>
                <div className="space-y-4">
                  {quizHistory.map((q) => (
                    <div
                      key={q.quizId}
                      className="glass-dark rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-sm truncate max-w-xs sm:max-w-md">
                          {q.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {q.totalAttempts} attempt{q.totalAttempts > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            q.bestScore >= 70
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {q.bestScore}% score
                        </span>
                        <Link
                          to={`/quiz/${q.quizId}`}
                          className="btn-primary text-xs px-4 py-2 font-semibold"
                        >
                          View Analysis
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Topics */}
            <div className="card p-6 shadow-lg">
              <h3 className="font-display font-bold text-lg text-white mb-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Quick Topics
              </h3>
              <p className="text-gray-500 text-xs mb-4">Click to auto-fill</p>
              <div className="space-y-2">
                {quickTopics.map((quickTopic) => (
                  <button
                    key={quickTopic}
                    onClick={() => setTopic(quickTopic)}
                    className="w-full p-3 text-left bg-gradient-to-r from-white/5 to-white/0 hover:from-white/15 hover:to-white/5 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 group"
                  >
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {quickTopic}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* My Courses Topics */}
            {myCourses?.length > 0 && (
              <div className="card p-6 shadow-lg">
                <h3 className="font-display font-bold text-lg text-white mb-1 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  My Courses
                </h3>
                <p className="text-gray-500 text-xs mb-4">
                  Your enrolled courses
                </p>
                <div className="space-y-2">
                  {myCourses.slice(0, 4).map((course) => (
                    <button
                      key={course._id}
                      onClick={() => setTopic(course.title)}
                      className="w-full p-3 text-left bg-gradient-to-r from-white/5 to-white/0 hover:from-white/15 hover:to-white/5 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 group"
                    >
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div className="card p-6 shadow-lg border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-600/5">
              <h3 className="font-display font-bold text-lg text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Pro Tips
              </h3>
              <ul className="text-xs text-gray-400 space-y-2.5">
                <li className="flex gap-2">
                  <span className="text-amber-400 flex-shrink-0">✓</span>
                  <span>Be specific with topics for better questions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 flex-shrink-0">✓</span>
                  <span>Start with easy difficulty if new</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 flex-shrink-0">✓</span>
                  <span>More questions = complete assessment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
