import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import SamplePaperForm from "../../components/samplePaper/SamplePaperForm";
import SamplePaperList from "../../components/samplePaper/SamplePaperList";
import api from "../../utils/api";
import SamplePaperDisplay from "../../components/samplePaper/SamplePaperDisplay";



export default function SamplePaperGeneratorPage() {
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef();

  // Fetch all sample papers
  const { data: papersData, refetch } = useQuery({
    queryKey: ["samplePapers"],
    queryFn: async () => {
      const res = await api.get("/sample-paper/my");
      return res.data;
    },
  });

  // Generate sample paper mutation
  const generateMutation = useMutation({
    mutationFn: async (formData) => {
      setIsLoading(true);
      try {
        const res = await api.post("/sample-paper/generate", {
          subject: formData.subject,
          syllabusText: formData.syllabus,
          totalMarks: parseInt(formData.totalMarks),
          duration: parseInt(formData.duration),
          difficultyLevel: formData.difficultyLevel,
          customSections: formData.useCustomSections ? formData.sections : null,
        });
        return res.data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      setGeneratedPaper(data.samplePaper);
      toast.success("Sample paper generated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate paper");
    },
  });

  const handleGenerate = (formData) => {
    generateMutation.mutate(formData);
  };

  const handleSave = async () => {
    if (!generatedPaper) {
      toast.error('No paper to download');
      return;
    }
    const data = JSON.stringify(generatedPaper, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPaper.title.replace(/\s+/g, '_') || 'sample_paper'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample paper downloaded');
  };


  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Sample Paper Generator
          </h1>
          <p className="text-gray-400">
            Generate AI-powered sample papers from your course syllabus
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Generate Paper
              </h2>
              <SamplePaperForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Column - Display & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Paper Preview */}
            {generatedPaper && (
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Generated Paper
                  </h2>
                  <div className="flex gap-2">

                    <button
                      onClick={handlePrint}
                      className="btn-outline text-sm"
                    >
                      Print
                    </button>
                  </div>
                </div>
                <div ref={printRef} id="sample-paper-print-area">
                  <SamplePaperDisplay paper={generatedPaper} />
                </div>
              </div>
            )}

            {/* Saved Papers List */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                My Sample Papers
              </h2>
              <SamplePaperList
                papers={papersData?.samplePapers || []}
                onRefresh={refetch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
