import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../context/authStore";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.role,
      );
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (error) {
      console.error("Registration error:", error);
      // Error is already handled by the authStore with toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xl shadow-primary-600/30">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mt-4">
            Create account
          </h1>
          <p className="text-gray-500 mt-2">Join LearnKro and start learning</p>
        </div>

        <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "student",
                  label: "Student",
                  icon: GraduationCap,
                  desc: "I want to learn",
                },
                {
                  value: "instructor",
                  label: "Instructor",
                  icon: BookOpen,
                  desc: "I want to teach",
                },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    form.role === value
                      ? "border-primary-500 bg-primary-600/20 text-primary-400"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {form.role === "instructor" && (
              <p className="text-xs text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                ⚠️ Instructor accounts require admin approval before you can
                create courses.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
