import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  Upload,
  Save,
  X,
  Loader2,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ManageCoursePage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: "",
    description: "",
    content: "",
    duration: "",
    lectureType: "video",
    video: null,
    asset: null
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then((r) => r.data.course),
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data) => api.put(`/courses/${courseId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Course updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const addSectionMutation = useMutation({
    mutationFn: (data) => api.post(`/courses/${courseId}/sections`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Section added!");
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, data }) => api.put(`/courses/${courseId}/sections/${sectionId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Section updated!");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId) => api.delete(`/courses/${courseId}/sections/${sectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Section deleted!");
    },
  });

  const addLectureMutation = useMutation({
    mutationFn: ({ sectionId, data }) => {
      return api.post(`/courses/${courseId}/sections/${sectionId}/lectures`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Lecture added!");
      setLectureForm({ title: "", description: "", content: "", duration: "", lectureType: "video", video: null, asset: null });
      setActiveSection(null);
    },
  });

  const updateLectureMutation = useMutation({
    mutationFn: ({ sectionId, lectureId, data }) => {
      return api.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Lecture updated!");
      setEditingLecture(null);
      setLectureForm({ title: "", description: "", content: "", duration: "", lectureType: "video", video: null, asset: null });
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: ({ sectionId, lectureId }) =>
      api.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      toast.success("Lecture deleted!");
    },
  });

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addSectionMutation.mutate({ title: newSectionTitle.trim() });
      setNewSectionTitle("");
      setIsAddingSection(false);
    }
  };

  const handleEditSectionSave = (sectionId) => {
    if (editingSectionTitle.trim()) {
      updateSectionMutation.mutate({ sectionId, data: { title: editingSectionTitle.trim() } });
      setEditingSectionId(null);
    }
  };

  const handleDeleteSection = (sectionId) => {
    if (confirm("Are you sure you want to delete this section and all its lectures?")) {
      deleteSectionMutation.mutate(sectionId);
    }
  };

  const handleAddLecture = (sectionId) => {
    if (!lectureForm.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", lectureForm.title);
    if (lectureForm.description) formData.append("description", lectureForm.description);
    if (lectureForm.content) formData.append("content", lectureForm.content);
    if (lectureForm.duration) formData.append("duration", lectureForm.duration);
    if (lectureForm.lectureType) formData.append("lectureType", lectureForm.lectureType);
    if (lectureForm.video) formData.append("video", lectureForm.video);
    if (lectureForm.asset) formData.append("asset", lectureForm.asset);

    addLectureMutation.mutate({ sectionId, data: formData });
  };

  const handleEditLecture = (sectionId, lecture) => {
    setEditingLecture(lecture._id);
    setLectureForm({
      title: lecture.title,
      description: lecture.description || "",
      content: lecture.content || "",
      duration: lecture.duration || "",
      lectureType: lecture.lectureType || "video",
      video: null,
      asset: null
    });
  };

  const handleUpdateLecture = (sectionId, lectureId) => {
    if (!lectureForm.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", lectureForm.title);
    if (lectureForm.description !== undefined) formData.append("description", lectureForm.description);
    if (lectureForm.content !== undefined) formData.append("content", lectureForm.content);
    if (lectureForm.duration !== undefined) formData.append("duration", lectureForm.duration);
    if (lectureForm.lectureType !== undefined) formData.append("lectureType", lectureForm.lectureType);
    if (lectureForm.video) formData.append("video", lectureForm.video);
    if (lectureForm.asset) formData.append("asset", lectureForm.asset);

    updateLectureMutation.mutate({ sectionId, lectureId, data: formData });
  };

  const handleDeleteLecture = (sectionId, lectureId) => {
    if (confirm("Are you sure you want to delete this lecture?")) {
      deleteLectureMutation.mutate({ sectionId, lectureId });
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLectureForm(prev => ({ ...prev, video: file }));
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-container text-center py-20">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Course Not Found</h2>
        <p className="text-gray-500">The course you're trying to manage doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Manage Course</h1>
          <p className="text-gray-500 mt-1">{course.title}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/instructor/courses")}
            className="btn-secondary"
          >
            Back to Courses
          </button>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="btn-primary"
          >
            View Course
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sections and Lectures */}
        <div className="lg:col-span-2 space-y-6">
          {course.sections?.map((section, sectionIndex) => (
            <div key={section._id} className="card p-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                {editingSectionId === section._id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editingSectionTitle}
                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                      className="input"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSectionSave(section._id)}
                    />
                    <button
                      onClick={() => handleEditSectionSave(section._id)}
                      className="btn-primary px-3 py-2"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingSectionId(null)}
                      className="btn-secondary px-3 py-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      {section.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSectionId(section._id);
                          setEditingSectionTitle(section.title);
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section._id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Lectures */}
              <div className="space-y-3">
                {section.lectures?.map((lecture, lectureIndex) => (
                  <div key={lecture._id} className="bg-dark-800 rounded-lg p-4">
                    {editingLecture === lecture._id ? (
                      // Edit Lecture Form
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={lectureForm.title}
                          onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Lecture title"
                          className="input"
                        />
                        <textarea
                          value={lectureForm.description}
                          onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description"
                          className="input"
                          rows={2}
                        />
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Lecture Type</label>
                          <select
                            value={lectureForm.lectureType}
                            onChange={(e) => setLectureForm(prev => ({ ...prev, lectureType: e.target.value, video: null, asset: null }))}
                            className="input text-xs"
                          >
                            <option value="video">Video Lecture</option>
                            <option value="pdf">PDF / Document</option>
                            <option value="text">Text Content Only</option>
                          </select>
                        </div>

                        {lectureForm.lectureType === "video" && (
                          <>
                            <input
                              type="text"
                              value={lectureForm.duration}
                              onChange={(e) => setLectureForm(prev => ({ ...prev, duration: e.target.value }))}
                              placeholder="Duration (e.g., 5 min)"
                              className="input"
                            />
                            <div className="space-y-1">
                              <label className="block text-xs text-gray-400">Upload Video</label>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) setLectureForm(prev => ({ ...prev, video: file }));
                                }}
                                className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
                              />
                            </div>
                          </>
                        )}

                        {lectureForm.lectureType === "pdf" && (
                          <div className="space-y-1">
                            <label className="block text-xs text-gray-400">Upload PDF Document</label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) setLectureForm(prev => ({ ...prev, asset: file }));
                              }}
                              className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
                            />
                          </div>
                        )}

                        {lectureForm.lectureType === "text" && (
                          <textarea
                            value={lectureForm.content}
                            onChange={(e) => setLectureForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Content (HTML allowed)"
                            className="input"
                            rows={4}
                          />
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateLecture(section._id, lecture._id)}
                            disabled={updateLectureMutation.isPending}
                            className="btn-primary flex-1"
                          >
                            {updateLectureMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingLecture(null);
                              setLectureForm({ title: "", description: "", content: "", duration: "", lectureType: "video", video: null, asset: null });
                            }}
                            className="btn-secondary"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Lecture Display
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            {lecture.lectureType === "pdf" ? (
                              <BookOpen className="w-4 h-4 text-primary-400" />
                            ) : lecture.lectureType === "text" ? (
                              <FileText className="w-4 h-4 text-primary-400" />
                            ) : (
                              <Video className="w-4 h-4 text-primary-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{lecture.title}</h4>
                            <p className="text-sm text-gray-500">{lecture.description}</p>
                            <p className="text-xs text-gray-600">
                              {lecture.lectureType === "pdf" ? "Document (PDF)" : lecture.lectureType === "text" ? "Text Content" : lecture.duration || "No duration set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditLecture(section._id, lecture)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLecture(section._id, lecture._id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Lecture Button */}
                {activeSection === section._id ? (
                  <div className="bg-dark-800 rounded-lg p-4 space-y-4">
                    <input
                      type="text"
                      value={lectureForm.title}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Lecture title"
                      className="input"
                    />
                    <textarea
                      value={lectureForm.description}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      className="input"
                      rows={2}
                    />
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Lecture Type</label>
                      <select
                        value={lectureForm.lectureType}
                        onChange={(e) => setLectureForm(prev => ({ ...prev, lectureType: e.target.value, video: null, asset: null }))}
                        className="input text-xs"
                      >
                        <option value="video">Video Lecture</option>
                        <option value="pdf">PDF / Document</option>
                        <option value="text">Text Content Only</option>
                      </select>
                    </div>

                    {lectureForm.lectureType === "video" && (
                      <>
                        <input
                          type="text"
                          value={lectureForm.duration}
                          onChange={(e) => setLectureForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="Duration (e.g., 5 min)"
                          className="input"
                        />
                        <div className="space-y-1">
                          <label className="block text-xs text-gray-400">Upload Video</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
                          />
                        </div>
                      </>
                    )}

                    {lectureForm.lectureType === "pdf" && (
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-400">Upload PDF Document</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setLectureForm(prev => ({ ...prev, asset: file }));
                          }}
                          className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
                        />
                      </div>
                    )}

                    {lectureForm.lectureType === "text" && (
                      <textarea
                        value={lectureForm.content}
                        onChange={(e) => setLectureForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Content (HTML allowed)"
                        className="input"
                        rows={4}
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddLecture(section._id)}
                        disabled={addLectureMutation.isPending}
                        className="btn-primary flex-1"
                      >
                        {addLectureMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Lecture
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection(null);
                          setLectureForm({ title: "", description: "", content: "", duration: "", lectureType: "video", video: null, asset: null });
                        }}
                        className="btn-secondary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSection(section._id)}
                    className="w-full py-3 border-2 border-dashed border-dark-700 rounded-xl text-gray-500 hover:text-white hover:border-primary-500 hover:bg-primary-500/5 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mx-auto" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          {isAddingSection ? (
            <div className="card p-6 border-2 border-primary-500/50">
              <h3 className="font-semibold text-white mb-4">Add New Section</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Introduction to the Course"
                  className="input flex-1"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                />
                <button
                  onClick={handleAddSection}
                  disabled={addSectionMutation.isPending}
                  className="btn-primary"
                >
                  {addSectionMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSectionTitle("");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="w-full py-4 border-2 border-dashed border-dark-700 rounded-xl text-gray-500 hover:text-white hover:border-primary-500 hover:bg-primary-500/5 transition-all duration-200"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              Add New Section
            </button>
          )}
        </div>

        {/* Course Info Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">Course Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sections</span>
                <span className="text-white">{course.sections?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lectures</span>
                <span className="text-white">
                  {course.sections?.reduce((acc, section) => acc + (section.lectures?.length || 0), 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Enrollments</span>
                <span className="text-white">{course.enrollmentsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  course.isPublished
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => updateCourseMutation.mutate({ isPublished: !course.isPublished })}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                  course.isPublished
                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:shadow-yellow-500/10"
                    : "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:shadow-green-500/10"
                }`}
              >
                {course.isPublished ? "Unpublish Course" : "Publish Course"}
              </button>
              <button
                onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                className="w-full btn-secondary"
              >
                Edit Course Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}