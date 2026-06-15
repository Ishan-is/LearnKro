import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../context/authStore";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "admin") return "/admin";
    if (user.role === "instructor") return "/instructor";
    if (user.role === "student") return "/dashboard";
    return null;
  };

  return (
    <nav className="bg-dark-800/80 backdrop-blur-md border-b border-white/[0.04] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-50 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/10 group-hover:scale-105 transition-all duration-300">
              <span className="text-white text-sm font-bold">L</span>
            </div>
            <span>
              Learn<span className="text-primary-400 font-medium group-hover:text-primary-300 transition-colors">Kro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
            >
              Courses
            </Link>

            {token && user && (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === "student" && (
                  <Link
                    to="/dashboard/sample-paper"
                    className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
                  >
                    Sample Paper
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-white/[0.06]">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    {user.name}
                    <span className="inline-block px-2 py-0.5 text-[11px] bg-primary-500/10 text-primary-300 border border-primary-500/20 rounded-full capitalize font-medium">
                      {user.role}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 text-xs font-semibold transition-all duration-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </>
            )}

            {!token && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 text-gray-300 hover:text-white font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 hover:shadow-[0_4px_15px_rgba(99,102,241,0.2)] transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-white/[0.04] bg-dark-800">
          <Link
            to="/"
            className="block text-gray-300 hover:text-white py-2 font-medium text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className="block text-gray-300 hover:text-white py-2 font-medium text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Courses
          </Link>

          {token && user && (
            <>
              <Link
                to={getDashboardLink()}
                className="block text-gray-300 hover:text-white py-2 font-medium text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user.role === "student" && (
                <Link
                  to="/dashboard/roadmap"
                  className="block text-gray-300 hover:text-white py-2 font-medium text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Roadmap
                </Link>
              )}
              <div className="pt-3 border-t border-white/[0.04]">
                <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                  {user.name}
                  <span className="inline-block px-2 py-0.5 text-[11px] bg-primary-500/10 text-primary-300 border border-primary-500/20 rounded-full capitalize font-medium">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}

          {!token && (
            <div className="pt-3 border-t border-white/[0.04] space-y-2">
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-300 hover:text-white text-center font-semibold text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 text-center font-semibold text-sm transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
