import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function SamplePaperList({ papers, onRefresh }) {
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sample-paper/${id}`);
    },
    onSuccess: () => {
      toast.success("Sample paper deleted");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete");
    },
  });

  if (!papers || papers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">
          No sample papers yet. Generate one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {papers.map((paper) => (
        <div
          key={paper._id}
          className="bg-dark-700 border border-white/5 rounded-lg p-4 hover:border-primary-500/30 transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{paper.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{paper.subject}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Marks: {paper.totalMarks}</span>
                <span>Duration: {paper.duration} min</span>
                <span>Questions: {paper.questions?.length || 0}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const printWindow = window.open(
                    "",
                    "",
                    "height=600,width=800",
                  );
                  const printContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h1>${paper.title}</h1>
                      <p><strong>Subject:</strong> ${paper.subject}</p>
                      <p><strong>Total Marks:</strong> ${paper.totalMarks}</p>
                      <p><strong>Duration:</strong> ${paper.duration} minutes</p>
                      <hr>
                      ${paper.questions
                        .map(
                          (q, i) =>
                            `<p><strong>Q${i + 1}.</strong> ${q.question}</p>`,
                        )
                        .join("")}
                    </div>
                  `;
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Print
              </button>
              <button
                onClick={() => deleteMutation.mutate(paper._id)}
                disabled={deleteMutation.isPending}
                className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
