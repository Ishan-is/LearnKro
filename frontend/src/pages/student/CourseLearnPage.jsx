import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Video,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLecture, setCurrentLecture] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  const { data: enrollment, isLoading, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () =>
      api.get(`/enrollments/course/${courseId}`).then((r) => r.data.enrollment),
  });

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then((r) => r.data.course),
    enabled: !!enrollment,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data) =>
      api.put(`/enrollments/${enrollment?._id}/progress`, data),
    onSuccess: () => {
      refetchEnrollment();
    },
  });

  useEffect(() => {
    if (enrollment?.currentLecture !== undefined) {
      setCurrentLecture(enrollment.currentLecture);
    }
  }, [enrollment]);

  // Auto-expand the accordion section containing the active lecture on mount or active change
  useEffect(() => {
    if (course?.sections && currentLecture !== undefined) {
      let currentIndex = 0;
      const initialExpanded = {};

      for (let sIdx = 0; sIdx < course.sections.length; sIdx++) {
        const section = course.sections[sIdx];
        const lectureCount = section.lectures?.length || 0;

        if (currentLecture >= currentIndex && currentLecture < currentIndex + lectureCount) {
          initialExpanded[section._id || sIdx] = true;
          break;
        }
        currentIndex += lectureCount;
      }

      setExpandedSections((prev) => ({ ...prev, ...initialExpanded }));
    }
  }, [course, currentLecture]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleLectureComplete = (lectureIndex) => {
    if (!enrollment) return;

    const completedLectures = [...(enrollment.completedLectures || [])];
    if (!completedLectures.includes(lectureIndex)) {
      completedLectures.push(lectureIndex);
    }

    const totalLectures =
      course?.sections?.reduce(
        (acc, section) => acc + section.lectures.length,
        0,
      ) || 1;
    const completionPercentage = Math.round(
      (completedLectures.length / totalLectures) * 100,
    );

    updateProgressMutation.mutate({
      currentLecture: lectureIndex,
      completedLectures,
      completionPercentage,
      isCompleted: completionPercentage === 100,
    });
  };

  const toggleLectureComplete = (lectureIndex, e) => {
    e.stopPropagation();
    if (!enrollment) return;

    let completedLectures = [...(enrollment.completedLectures || [])];
    if (completedLectures.includes(lectureIndex)) {
      completedLectures = completedLectures.filter((idx) => idx !== lectureIndex);
    } else {
      completedLectures.push(lectureIndex);
    }

    const totalLectures =
      course?.sections?.reduce(
        (acc, section) => acc + (section.lectures?.length || 0),
        0,
      ) || 1;
    const completionPercentage = Math.round(
      (completedLectures.length / totalLectures) * 100,
    );

    updateProgressMutation.mutate({
      completedLectures,
      completionPercentage,
      isCompleted: completionPercentage === 100,
    });
  };

  const handleNextLecture = () => {
    if (!course?.sections) return;

    const allLectures = course.sections.flatMap((section) => section.lectures) || [];
    if (currentLecture < allLectures.length - 1) {
      const nextIndex = currentLecture + 1;
      setCurrentLecture(nextIndex);
      // Automatically persist last viewed lecture index
      updateProgressMutation.mutate({ currentLecture: nextIndex });
    }
  };

  const handlePrevLecture = () => {
    if (currentLecture > 0) {
      const prevIndex = currentLecture - 1;
      setCurrentLecture(prevIndex);
      // Automatically persist last viewed lecture index
      updateProgressMutation.mutate({ currentLecture: prevIndex });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!enrollment || !course) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-500">
            You may not be enrolled in this course.
          </p>
        </div>
      </div>
    );
  }

  const allLectures =
    course.sections?.flatMap((section) => section.lectures) || [];
  const currentLectureData = allLectures[currentLecture];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/my-courses")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            <div className="h-4 w-px bg-dark-800" />
            <div>
              <h1 className="font-semibold text-white text-base leading-tight">{course.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Lecture {allLectures.length > 0 ? currentLecture + 1 : 0} of {allLectures.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Course Progress</p>
              <p className="font-semibold text-white text-sm mt-0.5">
                {enrollment.completionPercentage}% Complete
              </p>
            </div>
            <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                style={{ width: `${enrollment.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentLectureData ? (
            <div className="max-w-4xl mx-auto">
              {/* Media Content Display */}
              <div className="aspect-video bg-dark-900 rounded-2xl mb-6 overflow-hidden border border-white/5 shadow-2xl relative">
                {currentLectureData.lectureType === "pdf" && currentLectureData.asset?.url ? (
                  <iframe
                    src={currentLectureData.asset.url}
                    title={currentLectureData.title}
                    className="w-full h-full border-0 bg-white"
                  />
                ) : currentLectureData.lectureType === "text" ? (
                  <div className="w-full h-full flex flex-col justify-center items-center p-8 text-center bg-dark-900">
                    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4 border border-primary-500/20 animate-float">
                      <FileText className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentLectureData.title}</h3>
                    <p className="text-gray-400 max-w-md text-sm">
                      This lecture is a text-based reading material. You can read the full lecture contents and notes below.
                    </p>
                  </div>
                ) : currentLectureData.video?.url ? (
                  <video
                    key={currentLectureData._id}
                    className="w-full h-full object-contain"
                    controls
                    poster={course.thumbnail}
                    onEnded={() => handleLectureComplete(currentLecture)}
                  >
                    <source
                      src={currentLectureData.video.url}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">Lecture video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lecture Info Card */}
              <div className="bg-dark-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-dark-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/10">
                      {currentLectureData.lectureType === "pdf" ? (
                        <BookOpen className="w-5 h-5 text-primary-400" />
                      ) : currentLectureData.lectureType === "text" ? (
                        <FileText className="w-5 h-5 text-primary-400" />
                      ) : (
                        <Play className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-white text-lg leading-tight">
                        {currentLectureData.title}
                      </h2>
                      <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[10px] uppercase font-bold tracking-wider mt-1.5">
                        {currentLectureData.lectureType || "video"}
                      </span>
                    </div>
                  </div>

                  {currentLectureData.lectureType === "pdf" && currentLectureData.asset?.url && (
                    <a
                      href={currentLectureData.asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Open PDF in New Tab
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  {currentLectureData.description && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {currentLectureData.description}
                      </p>
                    </div>
                  )}

                  {currentLectureData.content && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Lecture Notes</h4>
                      <div className="prose prose-invert max-w-none bg-dark-950 p-5 rounded-2xl border border-white/5 text-sm text-gray-300 leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentLectureData.content,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Lecture Not Found
                </h3>
                <p className="text-gray-500">This lecture doesn't exist.</p>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Sidebar */}
        <div className="w-80 bg-dark-900 border-l border-dark-800 p-6 overflow-y-auto flex flex-col justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Course Curriculum</h3>

            <div className="space-y-3">
              {course.sections?.map((section, sectionIndex) => {
                const isExpanded = !!expandedSections[section._id || sectionIndex];
                const sectionLecturesCount = section.lectures?.length || 0;

                return (
                  <div key={section._id} className="border-b border-dark-800/60 pb-3">
                    {/* Accordion Section Header */}
                    <button
                      onClick={() => toggleSection(section._id || sectionIndex)}
                      className="w-full flex items-center justify-between py-2 text-left hover:text-white transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-gray-200 group-hover:text-white text-sm truncate leading-snug">
                          {section.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {sectionLecturesCount} {sectionLecturesCount === 1 ? "lecture" : "lectures"}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0 transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0 transition-transform" />
                      )}
                    </button>

                    {/* Collapsible Section Body */}
                    {isExpanded && (
                      <div className="space-y-1.5 mt-2 pl-1 animate-slide-down">
                        {section.lectures?.map((lecture, lectureIndex) => {
                          const globalIndex =
                            course.sections
                              .slice(0, sectionIndex)
                              .reduce((acc, s) => acc + (s.lectures?.length || 0), 0) +
                            lectureIndex;

                          const isCompleted = enrollment.completedLectures?.includes(globalIndex);
                          const isCurrent = globalIndex === currentLecture;

                          return (
                            <div
                              key={lecture._id}
                              onClick={() => setCurrentLecture(globalIndex)}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                                isCurrent
                                  ? "bg-primary-600/10 border-primary-500/20 text-white"
                                  : "border-transparent hover:bg-dark-800/80 text-gray-400 hover:text-white"
                              }`}
                            >
                              {/* Checkbox wrapper */}
                              <label className="flex items-center shrink-0 cursor-pointer p-0.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={(e) => toggleLectureComplete(globalIndex, e)}
                                  className="w-4 h-4 rounded border-dark-700 bg-dark-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900 focus:ring-2 cursor-pointer transition-colors"
                                />
                              </label>

                              {/* Lecture Meta */}
                              <div className="flex-1 min-w-0 flex items-start gap-2">
                                <div className="mt-0.5 shrink-0">
                                  {lecture.lectureType === "pdf" ? (
                                    <BookOpen className="w-3.5 h-3.5 text-primary-400" />
                                  ) : lecture.lectureType === "text" ? (
                                    <FileText className="w-3.5 h-3.5 text-primary-400" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 text-primary-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate leading-tight">
                                    {lecture.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-600 shrink-0" />
                                    {lecture.lectureType === "pdf"
                                      ? "PDF Document"
                                      : lecture.lectureType === "text"
                                      ? "Reading text"
                                      : lecture.duration || "5 min"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3 pt-4 border-t border-dark-800 shrink-0">
            <button
              onClick={handlePrevLecture}
              disabled={currentLecture === 0}
              className="flex-1 btn-secondary text-xs px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </button>
            <button
              onClick={handleNextLecture}
              disabled={currentLecture >= allLectures.length - 1}
              className="flex-1 btn-primary text-xs px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
