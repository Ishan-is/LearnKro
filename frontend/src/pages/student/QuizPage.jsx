import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, Trophy, RotateCcw, Loader2 } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => api.get(`/quiz/${quizId}`).then((r) => r.data.quiz),
  });

  // Timer
  useEffect(() => {
    if (!quiz) return;
    setTimeLeft(quiz.timeLimit * 60);
    setAnswers(new Array(quiz.totalQuestions).fill(null));
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const submitMutation = useMutation({
    mutationFn: (data) => api.post(`/quiz/${quizId}/submit`, data).then((r) => r.data.result),
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
    },
    onError: () => toast.error("Submission failed"),
  });

  const handleSubmit = () => {
    if (submitted) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({ answers: answers.map((a) => a ?? -1), timeTaken });
  };

  const handleSelect = (optionIndex) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  if (!quiz) return <div className="min-h-screen bg-dark-950 flex items-center justify-center text-gray-500">Quiz not found</div>;

  // Results screen
  if (submitted && result) {
    const percentage = result.percentage;
    const passed = result.passed;
    return (
      <div className="min-h-screen bg-dark-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Score */}
          <div className="card p-8 text-center mb-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 ${passed ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {passed ? <Trophy className="w-10 h-10 text-green-400" /> : <XCircle className="w-10 h-10 text-red-400" />}
            </div>
            <h1 className="font-display font-bold text-4xl text-white mb-2">
              {passed ? "Congratulations! 🎉" : "Keep Practicing! 💪"}
            </h1>
            <p className="text-gray-500 mb-6">{quiz.title}</p>
            <div className="text-7xl font-display font-black mb-2" style={{ color: passed ? "#4ade80" : "#f87171" }}>
              {percentage}%
            </div>
            <p className="text-gray-400">
              {result.score} out of {result.total} correct
            </p>
            {result.timeTaken && (
              <p className="text-gray-600 text-sm mt-2">
                Completed in {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button onClick={() => navigate("/dashboard/quiz-generator")} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> New Quiz
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary flex-1">
              Dashboard
            </button>
          </div>

          {/* Review answers */}
          <div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full btn-outline mb-4"
            >
              {showExplanation ? "Hide" : "Review"} Answers & Explanations
            </button>

            {showExplanation && (
              <div className="space-y-4">
                {result.results.map((q, i) => (
                  <div key={i} className={`card p-5 border ${q.isCorrect ? "border-green-500/20" : "border-red-500/20"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {q.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="font-medium text-white text-sm">Q{i + 1}: {q.question}</p>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`px-3 py-2 rounded-xl text-sm ${
                            j === q.correctAnswer
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : j === q.yourAnswer && !q.isCorrect
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "text-gray-500"
                          }`}
                        >
                          {opt}
                          {j === q.correctAnswer && " ✓"}
                          {j === q.yourAnswer && j !== q.correctAnswer && " ✗ (your answer)"}
                        </div>
                      ))}
                      {q.explanation && (
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-white/5 rounded-xl">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.totalQuestions) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="glass-dark border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-white text-sm">{quiz.title}</h1>
            <p className="text-xs text-gray-500">{answeredCount} of {quiz.totalQuestions} answered</p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
            timeLeft !== null && timeLeft < 60 ? "bg-red-500/20 text-red-400" : "glass text-gray-300"
          }`}>
            <Clock className="w-4 h-4" />
            {timeLeft !== null ? formatTime(timeLeft) : `${quiz.timeLimit}:00`}
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="badge bg-primary-600/20 text-primary-400 text-sm font-bold">
                Q {currentQ + 1}/{quiz.totalQuestions}
              </span>
              {question?.difficulty && (
                <span className={`badge text-xs ${
                  question.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                  question.difficulty === "hard" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {question.difficulty}
                </span>
              )}
            </div>

            <h2 className="font-semibold text-white text-xl mb-8 leading-relaxed">
              {question?.question}
            </h2>

            <div className="space-y-3">
              {question?.options?.map((option, i) => {
                const optionLetters = ["A", "B", "C", "D"];
                const isSelected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-600/20 text-white"
                        : "border-white/5 text-gray-400 hover:border-white/20 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                      isSelected ? "bg-primary-600 text-white" : "bg-white/10 text-gray-500"
                    }`}>
                      {optionLetters[i]}
                    </span>
                    <span className="text-sm">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentQ((q) => q - 1)}
              disabled={currentQ === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentQ < quiz.totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Quiz</>
                )}
              </button>
            )}
          </div>

          {/* Question dots */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  i === currentQ
                    ? "bg-primary-600 text-white"
                    : answers[i] !== null
                    ? "bg-green-600/40 text-green-400 border border-green-500/30"
                    : "glass text-gray-500 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
