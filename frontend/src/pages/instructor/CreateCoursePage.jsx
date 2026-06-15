import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Upload, PlusCircle, X, Loader2, BookOpen } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const categories = ["Web Development", "Mobile Development", "Data Science", "Machine Learning", "Design", "Business", "Marketing", "Other"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: categories[0], level: "Beginner",
    price: "", isFree: false, language: "English", tags: [], requirements: [], learningOutcomes: [],
  });

  const createMutation = useMutation({
    mutationFn: (fd) => api.post("/courses", fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: ({ data }) => {
      toast.success("Course created!");
      navigate(`/instructor/courses/${data.course._id}/manage`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    if (thumbnail) fd.append("thumbnail", thumbnail);
    createMutation.mutate(fd);
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addToArray = (field, value) => {
    if (!value.trim()) return;
    setForm((f) => ({ ...f, [field]: [...f[field], value.trim()] }));
  };

  const removeFromArray = (field, idx) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Create New Course</h1>
        <p className="text-gray-500 mt-1">Share your knowledge with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-white">Basic Information</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Course Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Complete React.js Mastery 2024"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what students will learn..."
              className="input resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="input"
              >
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Language</label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Price (₹)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={form.isFree}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? "0" : "" })}
                    className="rounded"
                  />
                  <label htmlFor="isFree" className="text-sm text-gray-400">Free Course</label>
                </div>
                {!form.isFree && (
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 999"
                    className="input"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Course Thumbnail</h2>
          <label className="cursor-pointer block">
            {thumbnailPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Change Thumbnail</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary-500/50 transition-colors bg-dark-900/50">
                <Upload className="w-10 h-10 text-gray-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-400 font-medium">Click to upload thumbnail</p>
                  <p className="text-xs text-gray-600">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
          </label>
        </div>

        {/* Learning Outcomes */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">What Students Will Learn</h2>
          <div className="space-y-2 mb-3">
            {form.learningOutcomes.map((item, i) => (
              <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <span className="text-sm text-gray-300 flex-1">{item}</span>
                <button type="button" onClick={() => removeFromArray("learningOutcomes", i)}>
                  <X className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <AddItemInput
            placeholder="e.g. Build full-stack web apps"
            onAdd={(v) => addToArray("learningOutcomes", v)}
          />
        </div>

        {/* Requirements */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Requirements</h2>
          <div className="space-y-2 mb-3">
            {form.requirements.map((item, i) => (
              <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <span className="text-sm text-gray-300 flex-1">{item}</span>
                <button type="button" onClick={() => removeFromArray("requirements", i)}>
                  <X className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <AddItemInput
            placeholder="e.g. Basic JavaScript knowledge"
            onAdd={(v) => addToArray("requirements", v)}
          />
        </div>

        {/* Tags */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 badge bg-primary-600/20 text-primary-400">
                {tag}
                <button type="button" onClick={() => removeFromArray("tags", i)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <AddItemInput
            placeholder="e.g. React, JavaScript"
            onAdd={(v) => addToArray("tags", v)}
          />
        </div>

        <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
          {createMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating Course...</>
          ) : (
            <><PlusCircle className="w-5 h-5" /> Create Course</>
          )}
        </button>
      </form>
    </div>
  );
}

function AddItemInput({ placeholder, onAdd }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(value); setValue(""); } }}
        placeholder={placeholder}
        className="input text-sm flex-1"
      />
      <button
        type="button"
        onClick={() => { onAdd(value); setValue(""); }}
        className="btn-primary px-4 py-2"
      >
        Add
      </button>
    </div>
  );
}
