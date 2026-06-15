import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  User,
  LogOut,
  Users,
  Settings,
  BarChart2,
  PlusCircle,
  GraduationCap,
  BookMarked,
  ShieldCheck,
  FileText,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../context/authStore";
import Chatbot from "../chatbot/Chatbot";

const navConfig = {
  student: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/my-courses", icon: BookOpen, label: "My Courses" },
    {
      to: "/dashboard/quiz-generator",
      icon: Brain,
      label: "AI Quiz Generator",
    },
    { to: "/dashboard/sample-paper", icon: FileText, label: "Sample Paper" },
    { to: "/dashboard/profile", icon: User, label: "Profile" },
  ],
  instructor: [
    { to: "/instructor", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/instructor/courses", icon: BookOpen, label: "My Courses" },
    {
      to: "/instructor/courses/create",
      icon: PlusCircle,
      label: "Create Course",
    },
    { to: "/instructor/students", icon: GraduationCap, label: "Students" },
  ],
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/courses", icon: BookMarked, label: "Courses" },
  ],
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems = navConfig[role] || navConfig.student;

  const roleColors = {
    student: "from-primary-500 to-primary-700",
    instructor: "from-accent-500 to-teal-600",
    admin: "from-indigo-500 to-purple-600",
  };

  const roleIcons = {
    student: GraduationCap,
    instructor: BookOpen,
    admin: ShieldCheck,
  };
  const RoleIcon = roleIcons[role] || GraduationCap;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`p-6 border-b border-white/[0.04] ${collapsed ? "items-center" : ""}`}
      >
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <div
            className={`w-10 h-10 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/10`}
          >
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-extrabold text-white tracking-tight">Learn<span className="text-primary-400 font-medium">Kro</span></p>
              <p className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">{role} Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 mx-3 mt-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl shadow-inner">
          <div className="flex items-center gap-3">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center text-white font-bold`}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`flex-1 p-3 mt-2 space-y-1 ${collapsed ? "items-center" : ""}`}
      >
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`
            }
          >
            <Icon className="w-5 h-5" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col ${sidebarCollapsed ? "w-20" : "w-64"} flex-shrink-0 bg-dark-900 border-r border-white/[0.04] transition-all duration-200`}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-dark-900 border-r border-white/[0.04] z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop topbar */}
        <div className="hidden lg:flex items-center justify-between px-4 py-3 bg-dark-900 border-b border-white/[0.04]">
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-dark-950 p-2 text-gray-300 hover:bg-white/5 hover:text-white transition"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
          </button>
          <Link
            to="/"
            className="font-display font-extrabold text-white tracking-tight"
            onClick={() => setSidebarOpen(false)}
          >
            Learn<span className="text-primary-400 font-medium">Kro</span>
          </Link>
          <div className="w-6" />
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-900 border-b border-white/[0.04]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link
            to="/"
            className="font-display font-bold text-white"
            onClick={() => setSidebarOpen(false)}
          >
            Learn<span className="gradient-text">Kro</span>
          </Link>
          <div className="w-6" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Chatbot />
    </div>
  );
}
