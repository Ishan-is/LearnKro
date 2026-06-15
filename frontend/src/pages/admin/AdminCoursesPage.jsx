import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Eye, EyeOff, Loader2, Users, Star, Trash2 } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/admin/courses").then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/courses/${id}/publish`),
    onSuccess: ({ data: res }) => {
      queryClient.invalidateQueries(["admin-courses"]);
      toast.success(res.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-courses"]);
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete course");
    },
  });

  const handleDeleteClick = (id, title) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Course?",
      message: `Are you sure you want to delete the course "${title}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMutation.mutate(id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  if (isLoading) return (
    <div className="page-container flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Course Management</h1>
        <p className="text-gray-500 mt-1">{data?.courses?.length || 0} total courses</p>
      </div>

      {data?.courses?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Instructor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Stats</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.courses.map((course) => (
                  <tr key={course._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm font-medium text-white line-clamp-2">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {course.price === 0 ? "Free" : `₹${course.price}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-300">{course.instructor?.name}</p>
                        <p className="text-xs text-gray-600">{course.instructor?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-primary-600/20 text-primary-400 text-xs">{course.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.enrolledStudents?.length || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" /> {course.averageRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${course.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish/Unpublish */}
                        <button
                          onClick={() => toggleMutation.mutate(course._id)}
                          disabled={toggleMutation.isPending}
                          className={`p-2 rounded-xl transition-colors ${
                            course.isPublished
                              ? "text-yellow-400 hover:bg-yellow-500/20"
                              : "text-green-400 hover:bg-green-500/20"
                          }`}
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {course.isPublished ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteClick(course._id, course.title)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No courses found</p>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-xl text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="btn-secondary py-2 px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-4 text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-600/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
