import { useState } from "react";

export default function SamplePaperForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    subject: "",
    syllabus: "",
    totalMarks: "100",
    duration: "120",
    difficultyLevel: "mixed",
    useCustomSections: false,
    sections: [
      {
        sectionName: "Section A",
        questionType: "mixed",
        weightage: "25",
        questionsCount: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  const totalAllocatedMarks = formData.useCustomSections
    ? formData.sections.reduce((acc, curr) => acc + (parseInt(curr.weightage) || 0), 0)
    : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddSection = () => {
    setFormData((prev) => {
      const nextLetter = String.fromCharCode(65 + prev.sections.length);
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            sectionName: prev.sections.length < 26 ? `Section ${nextLetter}` : `Section ${prev.sections.length + 1}`,
            questionType: "mixed",
            weightage: "20",
            questionsCount: "",
          },
        ],
      };
    });
  };

  const handleRemoveSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index),
    }));
    // Remove errors associated with this section
    setErrors((prev) => {
      const cleanErrors = { ...prev };
      Object.keys(cleanErrors).forEach((key) => {
        if (key.startsWith(`section_${index}_`)) {
          delete cleanErrors[key];
        }
      });
      return cleanErrors;
    });
  };

  const handleSectionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value,
      };
      return {
        ...prev,
        sections: updatedSections,
      };
    });

    const fieldKey = field === "sectionName" ? "name" : field === "questionsCount" ? "count" : field;
    const errorKey = `section_${index}_${fieldKey}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.syllabus.trim()) newErrors.syllabus = "Syllabus is required";
    if (formData.totalMarks <= 0)
      newErrors.totalMarks = "Marks must be greater than 0";
    if (formData.duration <= 0)
      newErrors.duration = "Duration must be greater than 0";

    // Custom sections validation
    if (formData.useCustomSections) {
      if (formData.sections.length === 0) {
        newErrors.useCustomSections = "At least one section is required when custom formatting is enabled";
      } else {
        formData.sections.forEach((sec, index) => {
          if (!sec.sectionName.trim()) {
            newErrors[`section_${index}_name`] = "Section name required";
          }
          if (!sec.weightage || parseInt(sec.weightage) <= 0) {
            newErrors[`section_${index}_weightage`] = "Must be > 0";
          }
          if (sec.questionsCount && parseInt(sec.questionsCount) <= 0) {
            newErrors[`section_${index}_count`] = "Must be > 0";
          }
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit payload
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subject Name
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g., Physics, Mathematics"
          className={`input ${errors.subject ? "border-red-500" : ""}`}
        />
        {errors.subject && (
          <p className="text-red-400 text-xs mt-1">{errors.subject}</p>
        )}
      </div>

      {/* Syllabus */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Syllabus / Topics
        </label>
        <textarea
          name="syllabus"
          value={formData.syllabus}
          onChange={handleChange}
          placeholder="Paste your course syllabus or list of topics to cover..."
          rows={5}
          className={`input resize-none ${errors.syllabus ? "border-red-500" : ""}`}
        />
        {errors.syllabus && (
          <p className="text-red-400 text-xs mt-1">{errors.syllabus}</p>
        )}
      </div>

      {/* Total Marks & Duration Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total Marks
          </label>
          <input
            type="number"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleChange}
            min="1"
            className={`input ${errors.totalMarks ? "border-red-500" : ""}`}
          />
          {errors.totalMarks && (
            <p className="text-red-400 text-xs mt-1">{errors.totalMarks}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration (min)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="30"
            step="15"
            className={`input ${errors.duration ? "border-red-500" : ""}`}
          />
          {errors.duration && (
            <p className="text-red-400 text-xs mt-1">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Difficulty Level
        </label>
        <select
          name="difficultyLevel"
          value={formData.difficultyLevel}
          onChange={handleChange}
          className="input"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {/* Custom formatting option */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            name="useCustomSections"
            checked={formData.useCustomSections}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                useCustomSections: e.target.checked,
              }));
            }}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            Customize paper format (sections & weightage)
          </span>
        </label>
        {errors.useCustomSections && (
          <p className="text-red-400 text-xs mt-1">{errors.useCustomSections}</p>
        )}
      </div>

      {/* Custom Sections Configuration Panel */}
      {formData.useCustomSections && (
        <div className="space-y-4 border border-white/10 rounded-xl p-4 bg-white/5 animate-slide-down">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Sections Configuration</h3>
            <button
              type="button"
              onClick={handleAddSection}
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
            >
              + Add Section
            </button>
          </div>

          {formData.sections.map((section, index) => (
            <div key={index} className="bg-dark-800 border border-white/5 rounded-lg p-3 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Section {index + 1}</span>
                {formData.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(index)}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Section Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Section A"
                    value={section.sectionName}
                    onChange={(e) => handleSectionChange(index, "sectionName", e.target.value)}
                    className={`input text-xs py-1.5 px-3 ${
                      errors[`section_${index}_name`] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors[`section_${index}_name`] && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors[`section_${index}_name`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Question Type</label>
                  <select
                    value={section.questionType}
                    onChange={(e) => handleSectionChange(index, "questionType", e.target.value)}
                    className="input text-xs py-1.5 px-3"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="mcq">MCQ</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="long-answer">Long Answer</option>
                    <option value="case-study">Case Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Weightage (Marks)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    min="1"
                    value={section.weightage}
                    onChange={(e) => handleSectionChange(index, "weightage", e.target.value)}
                    className={`input text-xs py-1.5 px-3 ${
                      errors[`section_${index}_weightage`] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors[`section_${index}_weightage`] && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors[`section_${index}_weightage`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Question Count (Opt)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    min="1"
                    value={section.questionsCount}
                    onChange={(e) => handleSectionChange(index, "questionsCount", e.target.value)}
                    className={`input text-xs py-1.5 px-3 ${
                      errors[`section_${index}_count`] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors[`section_${index}_count`] && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors[`section_${index}_count`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Section Summary */}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Total Marks Target:</span>
              <span className="font-semibold text-white">{formData.totalMarks} marks</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Section Marks Allocated:</span>
              <span
                className={`font-semibold transition-colors ${
                  totalAllocatedMarks !== parseInt(formData.totalMarks) ? "text-accent-400" : "text-green-400"
                }`}
              >
                {totalAllocatedMarks} marks
              </span>
            </div>
            {totalAllocatedMarks !== parseInt(formData.totalMarks) && (
              <p className="text-[11px] text-accent-400 leading-tight mt-1">
                ⚠️ Sum of section weightages ({totalAllocatedMarks}) does not match Total Marks ({formData.totalMarks}).
                The AI will attempt to scale or adjust questions.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? "Generating..." : "Generate Paper"}
      </button>
    </form>
  );
}
