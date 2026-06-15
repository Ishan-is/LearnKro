import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star, Users, Clock, BookOpen, Play, ChevronDown, ChevronUp,
  CheckCircle, Lock, Globe, BarChart2, ArrowRight, Loader2
} from "lucide-react";
import api from "../utils/api";
import { useAuthStore } from "../context/authStore";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.course),
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ["enrollment-check", id],
    queryFn: () => api.get(`/enrollments/check/${id}`).then((r) => r.data),
    enabled: !!user && user.role === "student",
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post(`/enrollments/${id}`),
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      navigate(`/learn/${id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Enrollment failed"),
  });

  const handleEnroll = () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "student") { toast.error("Only students can enroll"); return; }
    enrollMutation.mutate();
  };

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  if (!data) return <div className="page-container text-center py-24 text-gray-500">Course not found</div>;

  const course = data;
  const isEnrolled = enrollmentData?.isEnrolled;
  const totalLectures = course.sections?.reduce((acc, s) => acc + s.lectures.length, 0) || 0;

  return (
    <div>
      {/* Hero */}
      <div className="bg-dark-900 border-b border-white/5">
        <div className="page-container py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <span className="badge bg-primary-600/20 text-primary-400 mb-4">{course.category}</span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-400 leading-relaxed mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-yellow-400">{course.averageRating?.toFixed(1) || "New"}</span>
                  <span className="text-gray-500">({course.totalRatings} ratings)</span>
                </div>
                <span className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" /> {course.enrolledStudents?.length || 0} students
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Globe className="w-4 h-4" /> {course.language}
                </span>
                <span className={`badge ${
                  course.level === "Beginner" ? "bg-green-500/20 text-green-400" :
                  course.level === "Intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>{course.level}</span>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-3 mt-6 p-4 glass rounded-2xl">
                  {course.instructor.avatar?.url ? (
                    <img src={course.instructor.avatar.url} alt={course.instructor.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                      {course.instructor.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="font-semibold text-white">{course.instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-20 overflow-visible">
                {course.thumbnail?.url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-6">
                    <p className="font-display font-bold text-4xl text-white">
                      {course.isFree || course.price === 0 ? (
                        <span className="text-green-400">Free</span>
                      ) : `₹${course.price}`}
                    </p>
                  </div>

                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/learn/${id}`)}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-4"
                    >
                      <Play className="w-5 h-5" /> Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-4"
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Enroll Now <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  )}

                  <ul className="space-y-2.5 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-400" /> {totalLectures} lectures</li>
                    {course.totalDuration > 0 && (
                      <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-400" /> {formatDuration(course.totalDuration)} total</li>
                    )}
                    <li className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary-400" /> {course.level} level</li>
                    <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary-400" /> {course.language}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="page-container py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.learningOutcomes?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-4">What you'll learn</h2>
                <div className="glass-dark rounded-2xl p-6 grid sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            {course.sections?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-4">Course Curriculum</h2>
                <div className="space-y-3">
                  {course.sections.map((section, i) => (
                    <div key={section._id} className="card overflow-visible">
                      <button
                        onClick={() => setExpandedSection(expandedSection === i ? -1 : i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-white">{section.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{section.lectures.length} lectures</p>
                        </div>
                        {expandedSection === i ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedSection === i && (
                        <div className="border-t border-white/5">
                          {section.lectures.map((lecture) => (
                            <div key={lecture._id} className="flex items-center gap-3 p-3 px-4 hover:bg-white/5 transition-colors">
                              {lecture.isPreview ? (
                                <Play className="w-4 h-4 text-primary-400 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              )}
                              <span className={`text-sm flex-1 ${lecture.isPreview ? "text-gray-300" : "text-gray-500"}`}>
                                {lecture.title}
                              </span>
                              {lecture.isPreview && (
                                <span className="text-xs text-primary-400 border border-primary-500/30 px-2 py-0.5 rounded-full">Preview</span>
                              )}
                              {lecture.duration > 0 && (
                                <span className="text-xs text-gray-600">{Math.round(lecture.duration / 60)}m</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {course.ratings?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-4">
                  Student Reviews ({course.ratings.length})
                </h2>
                <div className="space-y-4">
                  {course.ratings.slice(0, 5).map((r, i) => (
                    <div key={i} className="glass-dark rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                          {r.user?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{r.user?.name || "Student"}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.review && <p className="text-gray-400 text-sm">{r.review}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
