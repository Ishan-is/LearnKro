import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BookOpen, Lock, Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../context/authStore";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Simple password criteria checks
  const criteria = {
    length: form.password.length >= 6,
    hasNumber: /\d/.test(form.password),
    match: form.password === form.confirmPassword && form.password.length > 0,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!criteria.length) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!criteria.match) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const user = await resetPassword(token, form.password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "instructor") navigate("/instructor");
      else navigate("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xl shadow-primary-600/30">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mt-4">Create New Password</h1>
          <p className="text-gray-500 mt-2">Enter your secure new password below</p>
        </div>

        {/* Form */}
        <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                {criteria.length ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-rose-400" />
                )}
                <span className={criteria.length ? "text-emerald-400" : "text-gray-400"}>
                  Minimum 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criteria.hasNumber ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-rose-400" />
                )}
                <span className={criteria.hasNumber ? "text-emerald-400" : "text-gray-400"}>
                  Contains at least one number
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criteria.match ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-rose-400" />
                )}
                <span className={criteria.match ? "text-emerald-400" : "text-gray-400"}>
                  Passwords match
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !criteria.length || !criteria.match}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Reset Password <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
