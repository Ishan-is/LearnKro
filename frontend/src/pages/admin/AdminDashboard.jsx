import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, TrendingUp, ShieldCheck, Loader2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../../utils/api";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data.stats),
  });

  const stats = data;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-primary-500 to-primary-700", sub: "Registered users" },
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "from-accent-500 to-orange-700", sub: "Available courses" },
    { label: "Total Enrollments", value: stats?.totalEnrollments || 0, icon: TrendingUp, color: "from-green-500 to-green-700", sub: "Course enrollments" },
    { label: "Pending Approvals", value: stats?.pendingInstructors || 0, icon: ShieldCheck, color: "from-yellow-500 to-yellow-700", sub: "Instructor requests" },
  ];

  const roleChartData = stats?.usersByRole?.map((r) => ({
    name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
    count: r.count,
  })) || [];

  const categoryChartData = stats?.coursesByCategory?.map((c) => ({
    name: c._id,
    count: c.count,
  })).sort((a, b) => b.count - a.count).slice(0, 8) || [];

  const COLORS = ["#6272f1", "#f97316", "#4ade80", "#a78bfa", "#fb923c", "#38bdf8", "#f472b6", "#34d399"];

  if (isLoading) return (
    <div className="page-container flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-bold text-3xl text-white">{value}</p>
            <p className="text-xs font-semibold text-gray-300 mt-0.5">{label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Users by Role Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Users by Role</h2>
          {roleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roleChartData}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {roleChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data</div>
          )}
        </div>

        {/* Courses by Category Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Courses by Category</h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#6b7280", fontSize: 10 }} width={100} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data</div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" /> Recent Signups
          </h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${
                    user.role === "admin" ? "bg-red-500/20 text-red-400" :
                    user.role === "instructor" ? "bg-accent-500/20 text-accent-400" :
                    "bg-primary-500/20 text-primary-400"
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-600 hidden sm:block">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
