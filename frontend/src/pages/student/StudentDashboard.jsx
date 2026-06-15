import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
  ArrowRight,
  Play,
  FileText,
} from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.get("/enrollments/my").then((r) => r.data.enrollments),
  });

  const { data: quizResults } = useQuery({
    queryKey: ["my-quiz-results"],
    queryFn: () => api.get("/quiz/my-results").then((r) => r.data.results),
  });

  const avgProgress = enrollments?.length
    ? Math.round(
        enrollments.reduce((acc, e) => acc + e.completionPercentage, 0) /
          enrollments.length,
      )
    : 0;

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollments?.length || 0,
      icon: BookOpen,
      color: "from-primary-500 to-primary-700",
      link: "/dashboard/my-courses",
    },
    {
      label: "Quizzes Taken",
      value: quizResults?.length || 0,
      icon: Brain,
      color: "from-purple-500 to-purple-700",
    },
    {
      label: "Avg Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "from-green-500 to-green-700",
    },
    {
      label: "Completed",
      value: enrollments?.filter((e) => e.isCompleted).length || 0,
      icon: Clock,
      color: "from-accent-500 to-orange-700",
    },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">
          Welcome back,{" "}
          <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <div
            key={label}
            className={`card p-5 ${link ? "cursor-pointer hover:border-white/10 transition-colors" : ""}`}
            onClick={() => link && (window.location.href = link)}
          >
            <div
              className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-bold text-2xl text-white">
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-lg">
              Continue Learning
            </h2>
            <Link
              to="/dashboard/my-courses"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {enrollments?.length > 0 ? (
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <Link
                  key={enrollment._id}
                  to={`/learn/${enrollment.course?._id}`}
                  className="card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all group"
                >
                  <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-dark-900">
                    {enrollment.course?.thumbnail?.url ? (
                      <img
                        src={enrollment.course.thumbnail.url}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-400/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate group-hover:text-primary-300 transition-colors">
                      {enrollment.course?.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-dark-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                          style={{
                            width: `${enrollment.completionPercentage}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {enrollment.completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                You haven't enrolled in any courses yet
              </p>
              <Link to="/courses" className="btn-primary inline-flex">
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-white text-lg mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/dashboard/quiz-generator"
              className="card p-4 flex items-center gap-3 hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  Generate AI Quiz
                </p>
                <p className="text-xs text-gray-500">Test your knowledge</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white ml-auto transition-colors" />
            </Link>

            <Link
              to="/dashboard/sample-paper"
              className="card p-4 flex items-center gap-3 hover:border-blue-500/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  Sample Paper Generator
                </p>
                <p className="text-xs text-gray-500">Create AI sample papers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white ml-auto transition-colors" />
            </Link>

            <Link
              to="/courses"
              className="card p-4 flex items-center gap-3 hover:border-primary-500/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">Browse Courses</p>
                <p className="text-xs text-gray-500">Discover new topics</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white ml-auto transition-colors" />
            </Link>
          </div>

          {/* Recent Quiz Results */}
          {quizResults?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Recent Quiz Results
              </h3>
              <div className="space-y-2">
                {quizResults.slice(0, 3).map((r) => (
                  <div key={r.quizId} className="glass rounded-xl p-3">
                    <p className="text-sm text-white truncate">{r.title}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className={`text-xs font-bold ${r.bestScore >= 60 ? "text-green-400" : "text-red-400"}`}
                      >
                        {r.bestScore}%
                      </span>
                      <span className="text-xs text-gray-600">
                        {r.totalAttempts} attempts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
