import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Brain, BookOpen, Users, Star, ArrowRight, Zap, Shield, TrendingUp, Play, ChevronRight } from "lucide-react";
import api from "../utils/api";
import CourseCard from "../components/course/CourseCard";
import { useAuthStore } from "../context/authStore";

const stats = [
  { label: "Active Students", value: "10K+", icon: Users },
  { label: "Courses Available", value: "500+", icon: BookOpen },
  { label: "AI Quizzes Generated", value: "50K+", icon: Brain },
  { label: "Average Rating", value: "4.8★", icon: Star },
];

const features = [
  {
    icon: Brain,
    title: "AI Quiz Generator",
    description: "Generate personalized quizzes on any topic instantly using advanced AI technology.",
    bgClass: "bg-purple-500/10 border border-purple-500/20",
    iconClass: "text-purple-400",
  },
  {
    icon: Zap,
    title: "AI Chatbot Assistant",
    description: "Get instant help and guidance from our intelligent AI chatbot, available 24/7.",
    bgClass: "bg-primary-500/10 border border-primary-500/20",
    iconClass: "text-primary-400",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and performance insights.",
    bgClass: "bg-accent-500/10 border border-accent-500/20",
    iconClass: "text-accent-400",
  },
  {
    icon: Shield,
    title: "Expert Instructors",
    description: "Learn from verified instructors with real-world experience in their fields.",
    bgClass: "bg-indigo-500/10 border border-indigo-500/20",
    iconClass: "text-indigo-400",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  
  const { data } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: () => api.get("/courses?limit=8&sort=-enrolledStudents").then((r) => r.data),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
          {/* Grid pattern with fadeout radial mask */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className="page-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-full text-xs text-primary-300 mb-8 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
            Powered by Groq AI
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6 max-w-4xl mx-auto tracking-tight">
            Learn Smarter with{" "}
            <span className="gradient-text">AI-Powered</span> Education
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the future of learning with AI quiz generation, intelligent chatbot assistance, and structured courses from expert instructors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? (user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/dashboard") : "/register"}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 shadow-xl shadow-primary-600/10"
            >
              {user ? "Go to Dashboard" : "Start Learning Free"} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/courses" className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
              <Play className="w-5 h-5 fill-white" /> Browse Courses
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-24 max-w-4xl mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card-hover p-6 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <p className="font-display font-extrabold text-3xl text-white tracking-tight">{value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-dark-900/30 border-y border-white/[0.02]">
        <div className="page-container">
          <div className="text-center mb-16">
            <p className="text-primary-400 font-semibold mb-3 tracking-wider text-xs uppercase">Why LearnKro?</p>
            <h2 className="font-display font-bold text-4xl text-white mb-4 tracking-tight">
              Everything you need to <span className="gradient-text">excel</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our platform combines the best of AI technology with structured learning to give you an unmatched educational experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description, bgClass, iconClass }) => (
              <div key={title} className="card-hover p-8 flex items-start gap-5 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${bgClass}`}>
                  <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-2 transition-colors group-hover:text-primary-300">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24">
        <div className="page-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary-400 font-medium mb-2">Popular Courses</p>
              <h2 className="font-display font-bold text-4xl text-white">
                Featured <span className="gradient-text">Courses</span>
              </h2>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.courses?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-600">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No courses available yet. Be the first to create one!</p>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/courses" className="btn-outline">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-24 bg-dark-900/30">
          <div className="page-container">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/[0.04] p-12 sm:p-16 text-center shadow-2xl">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="font-display font-bold text-4xl text-white mb-4 tracking-tight">
                  Ready to start your learning journey?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  Join thousands of students already learning on LearnKro with AI-powered tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-dark-950 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 hover:shadow-[0_4px_25px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] text-base">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/courses" className="btn-secondary">Browse Courses</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
