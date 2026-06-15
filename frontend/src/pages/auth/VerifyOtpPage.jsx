import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BookOpen, KeyRound, ArrowRight, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../context/authStore";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from route state or query params
  const queryParams = new URLSearchParams(location.search);
  const email = location.state?.email || queryParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      toast.error("No email specified. Please register or log in first.");
      navigate("/login");
    }
  }, [email, navigate]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const user = await verifyOtp(email, otp);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "instructor") navigate("/instructor");
      else navigate("/dashboard");
    } catch {}
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendOtp(email);
      setTimer(60);
      setCanResend(false);
      setOtp("");
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
          <h1 className="font-display font-bold text-3xl text-white mt-4">Verify your email</h1>
          <p className="text-gray-400 mt-2">We sent a 6-digit verification code to</p>
          <p className="text-primary-400 font-semibold mt-0.5">{email}</p>
        </div>

        {/* Form */}
        <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="input pl-10 text-center tracking-[1em] text-lg font-bold"
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
                <>Verify OTP <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Resend actions */}
          <div className="mt-6 text-center text-sm">
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Resend verification code
              </button>
            ) : (
              <p className="text-gray-500">
                Resend code in <span className="text-gray-300 font-medium">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
