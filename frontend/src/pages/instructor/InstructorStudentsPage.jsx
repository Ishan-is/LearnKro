import { useQuery } from "@tanstack/react-query";
import { Users, Loader2, BookOpen, TrendingUp } from "lucide-react";
import api from "../../utils/api";

export default function InstructorStudentsPage() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["instructor-students"],
    queryFn: () => api.get("/instructor/students").then((r) => r.data.enrollments),
  });

  if (isLoading) return (
    <div className="page-container flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Students</h1>
        <p className="text-gray-500 mt-1">{enrollments?.length || 0} total enrollments</p>
      </div>

      {enrollments?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Progress</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {enrollment.student?.avatar?.url ? (
                          <img src={enrollment.student.avatar.url} alt={enrollment.student.name} className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                            {enrollment.student?.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{enrollment.student?.name}</p>
                          <p className="text-xs text-gray-500">{enrollment.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-gray-300 line-clamp-1 max-w-[200px]">{enrollment.course?.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-dark-950 rounded-full overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${enrollment.isCompleted ? "bg-green-500" : "bg-primary-500"}`}
                            style={{ width: `${enrollment.completionPercentage}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${enrollment.isCompleted ? "text-green-400" : "text-gray-400"}`}>
                          {enrollment.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No students yet</h3>
          <p className="text-gray-600">Students will appear here once they enroll in your courses</p>
        </div>
      )}
    </div>
  );
}
