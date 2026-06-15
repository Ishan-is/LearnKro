// InstructorCoursesPage.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Eye,
  EyeOff,
  Settings,
  Users,
  Loader2,
  BookOpen,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () =>
      api.get("/courses/instructor/my-courses").then((r) => r.data.courses),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }) => api.put(`/courses/${id}`, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor-courses"]);
      toast.success("Status updated!");
    },
  });

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-white">
          My Courses
        </h1>
        <Link
          to="/instructor/courses/create"
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Create Course
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : courses?.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark-900">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-400/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {course.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{course.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.enrolledStudents?.length || 0} students
                  </span>
                  <span>•</span>
                  <span>{course.isFree ? "Free" : `₹${course.price}`}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`badge ${course.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <button
                  onClick={() => publishMutation.mutate({ id: course._id, isPublished: !course.isPublished })}
                  className="p-2 glass rounded-xl text-gray-400 hover:text-white transition-colors"
                  title={course.isPublished ? "Unpublish" : "Publish"}
                >
                  {course.isPublished ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <Link
                  to={`/instructor/courses/${course._id}/manage`}
                  className="p-2 glass rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first course and start teaching
          </p>
          <Link
            to="/instructor/courses/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Create Course
          </Link>
        </div>
      )}
    </div>
  );
}
