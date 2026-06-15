import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Users, DollarSign, TrendingUp, PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";

export default function InstructorDashboard() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["instructor-stats"],
    queryFn: () => api.get("/instructor/stats").then((r) => r.data.stats),
  });

  const { data: courses } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.get("/instructor/courses").then((r) => r.data.courses),
  });

  const statCards = [
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "from-primary-500 to-primary-700" },
    { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "from-purple-500 to-purple-700" },
    { label: "Total Enrollments", value: stats?.totalEnrollments || 0, icon: TrendingUp, color: "from-green-500 to-green-700" },
    { label: "Revenue (₹)", value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "from-accent-500 to-orange-700" },
  ];

  if (!user?.isApproved) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Pending Approval</h2>
          <p className="text-gray-500">Your instructor account is awaiting admin approval. You'll be notified once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Instructor Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/instructor/courses/create" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-bold text-2xl text-white">{isLoading ? "..." : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-lg">Your Courses</h2>
          <Link to="/instructor/courses" className="text-sm text-primary-400 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {courses?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id} className="card p-4">
                {course.thumbnail?.url && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-dark-900">
                    <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-medium text-white text-sm line-clamp-2 mb-2">{course.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledStudents?.length || 0} students</span>
                  <span className={`badge ${course.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <Link to={`/instructor/courses/${course._id}/manage`} className="btn-outline text-xs w-full text-center block py-2">
                  Manage Course
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No courses yet. Create your first course!</p>
            <Link to="/instructor/courses/create" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
