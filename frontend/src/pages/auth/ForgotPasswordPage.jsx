import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../context/authStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
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
          <h1 className="font-display font-bold text-3xl text-white mt-4">Reset Password</h1>
          <p className="text-gray-500 mt-2">Get a recovery link sent directly to your inbox</p>
        </div>

        {/* Form */}
        <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-600/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto text-primary-400">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white">Check your email</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We've sent a password reset link to <br />
                <span className="text-primary-400 font-medium">{email}</span>
              </p>
              <p className="text-xs text-gray-500">
                If you don't receive the email within a few minutes, please check your spam folder.
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
