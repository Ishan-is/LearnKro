export default function SamplePaperDisplay({ paper }) {
  if (!paper) return null;

  return (
    <div className="bg-white text-black p-8 rounded-lg">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
        <p className="text-gray-700 mb-4">{paper.description}</p>
        <div className="flex justify-center gap-6 text-sm">
          <span>
            <strong>Total Marks:</strong> {paper.totalMarks}
          </span>
          <span>
            <strong>Duration:</strong> {paper.duration} minutes
          </span>
          <span>
            <strong>Difficulty:</strong> {paper.difficultyLevel}
          </span>
        </div>
      </div>

      {/* Instructions */}
      {paper.instructions && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 underline">Instructions:</h2>
          <p className="text-sm leading-relaxed">{paper.instructions}</p>
        </div>
      )}

      {/* Questions by Section */}
      {paper.sections && paper.sections.length > 0 ? (
        paper.sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            <h3 className="text-lg font-bold mb-2 underline">
              {section.sectionName}
            </h3>
            {section.instructions && (
              <p className="text-sm mb-4 italic">{section.instructions}</p>
            )}

            {/* Questions in this section */}
            <div className="space-y-4">
              {section.questionIndices &&
                section.questionIndices.map((qIdx) => {
                  const q = paper.questions[qIdx];
                  if (!q) return null;

                  return (
                    <div key={qIdx} className="mb-4">
                      <div className="flex gap-2">
                        <span className="font-bold">Q{q.questionNumber}.</span>
                        <div className="flex-1">
                          <p className="text-sm mb-2">{q.question}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {q.options.map((option, oIdx) => (
                                <p key={oIdx} className="text-sm">
                                  ({String.fromCharCode(97 + oIdx)}) {option}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2">
                            [{q.marks} marks]
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      ) : (
        /* Display all questions if no sections */
        <div className="space-y-4">
          {paper.questions &&
            paper.questions.map((q, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex gap-2">
                  <span className="font-bold">Q{q.questionNumber}.</span>
                  <div className="flex-1">
                    <p className="text-sm mb-2">{q.question}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {q.options.map((option, oIdx) => (
                          <p key={oIdx} className="text-sm">
                            ({String.fromCharCode(97 + oIdx)}) {option}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      [{q.marks} marks]
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-600 border-t-2 border-black pt-4">
        <p>
          Generated on {new Date(paper.createdAt).toLocaleDateString()} by{" "}
          {paper.generatedBy}
        </p>
      </div>
    </div>
  );
}
