import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, Loader2 } from "lucide-react";
import api from "../../utils/api";

export default function MyCoursesPage() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const isCompletedFilter = filter === "completed";

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.get("/enrollments/my").then((r) => r.data.enrollments),
  });

  if (isLoading) return (
    <div className="page-container flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  const filteredEnrollments = isCompletedFilter
    ? enrollments?.filter((e) => e.isCompleted)
    : enrollments;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            {isCompletedFilter ? "Completed Courses" : "My Courses"}
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredEnrollments?.length || 0} {isCompletedFilter ? "courses completed" : "courses enrolled"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCompletedFilter && (
            <Link to="/dashboard/my-courses" className="btn-secondary text-sm">
              View All Enrolled
            </Link>
          )}
          <Link to="/courses" className="btn-primary text-sm">Browse More</Link>
        </div>
      </div>

      {filteredEnrollments?.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment._id} className="card-hover group">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-dark-900">
                {enrollment.course?.thumbnail?.url ? (
                  <img
                    src={enrollment.course.thumbnail.url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary-400/30" />
                  </div>
                )}
                {enrollment.isCompleted && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs text-primary-400 font-medium mb-1">{enrollment.course?.category}</p>
                <h3 className="font-semibold text-white mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
                  {enrollment.course?.title}
                </h3>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progress</span>
                    <span className={enrollment.isCompleted ? "text-green-400" : "text-primary-400"}>
                      {enrollment.completionPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${enrollment.isCompleted ? "bg-green-500" : "bg-gradient-to-r from-primary-500 to-primary-400"}`}
                      style={{ width: `${enrollment.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {enrollment.isCompleted ? "Completed" : "In Progress"}
                  </span>
                  <span>{enrollment.course?.totalLectures || 0} lectures</span>
                </div>

                <Link
                  to={`/learn/${enrollment.course?._id}`}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    enrollment.isCompleted
                      ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                      : "btn-primary"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {enrollment.isCompleted ? "Review Course" : enrollment.completionPercentage > 0 ? "Continue" : "Start Learning"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">Enroll in a course to start learning</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}
