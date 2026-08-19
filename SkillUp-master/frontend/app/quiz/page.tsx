"use client";
import { useState, useEffect } from "react";
import { Brain, FileText, CheckCircle, XCircle, Loader2, Trophy, Clock, Play } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getApiUrl } from "@/lib/api";

interface Document {
  ID: string;
  Filename: string;
  ProcessingStatus: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface Quiz {
  ID: string;
  DocumentID: string;
  Score?: number;
  TotalQuestions: number;
  Status: string;
  CreatedAt: string;
  AttemptedAt?: string;
}

interface QuizData {
  id: string;
  document_id: string;
  questions: Question[];
  total_questions: number;
  status: string;
}

export default function QuizPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [generating, setGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const getToken = () => localStorage.getItem("token");

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data?.filter((d: Document) => d.ProcessingStatus === "processed") || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/quizzes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async (docId: string) => {
    setGenerating(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/quizzes/generate/${docId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          num_questions: 10,
          difficulty: "medium",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuiz(data);
        setUserAnswers({});
        setResults(null);
        fetchQuizzes();
      } else {
        alert("Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Error generating quiz");
    } finally {
      setGenerating(false);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    // Check if all questions are answered
    const unanswered = currentQuiz.questions.filter((q) => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      const answers = currentQuiz.questions.map((q) => ({
        question_id: q.id,
        selected_option: userAnswers[q.id],
      }));

      const response = await fetch(`${getApiUrl()}/api/quizzes/${currentQuiz.id}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        fetchQuizzes();
      } else {
        alert("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchQuizzes();
  }, []);

  const getDocumentName = (docId: string) => {
    const doc = documents.find((d) => d.ID === docId);
    return doc?.Filename || "Unknown Document";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-950 text-white pt-20 lg:pt-32 px-4 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-neutral-300" />
            <h1 className="text-4xl font-bold text-neutral-100">Quizzes</h1>
          </div>
          <p className="text-neutral-400">Test your knowledge with AI-generated quizzes</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
          </div>
        ) : currentQuiz ? (
          /* Taking Quiz View */
          <div>
            {!results ? (
              <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">
                    Quiz: {getDocumentName(currentQuiz.document_id)}
                  </h2>
                  <button
                    onClick={() => setCurrentQuiz(null)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-6">
                  {currentQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-neutral-800/50 rounded-lg">
                      <p className="font-medium mb-4">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              userAnswers[q.id] === option
                                ? "bg-neutral-700 border border-neutral-600"
                                : "bg-neutral-800 hover:bg-neutral-750 border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={option}
                              checked={userAnswers[q.id] === option}
                              onChange={(e) =>
                                setUserAnswers({ ...userAnswers, [q.id]: e.target.value })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-3 bg-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Results View */
              <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
                <div className="text-center mb-8">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                  <p className="text-neutral-400">Here are your results</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <p className="text-sm text-neutral-400 mb-1">Score</p>
                      <p className="text-3xl font-bold">{results.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <p className="text-sm text-neutral-400 mb-1">Correct</p>
                      <p className="text-3xl font-bold text-green-500">
                        {Math.round((results.score / 100) * results.total_questions)}
                      </p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <p className="text-sm text-neutral-400 mb-1">Total</p>
                      <p className="text-3xl font-bold">{results.total_questions}</p>
                    </div>
                  </div>

                  {results.feedback && results.feedback.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Feedback:</h3>
                      <div className="space-y-2">
                        {results.feedback.map((f: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg flex items-start gap-3 ${
                              f.correct ? "bg-green-900/20" : "bg-red-900/20"
                            }`}
                          >
                            {f.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 text-sm">
                              <p className="font-medium mb-1">Question {idx + 1}</p>
                              {!f.correct && (
                                <p className="text-neutral-400">
                                  Correct answer: {f.correct_answer}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCurrentQuiz(null);
                      setResults(null);
                    }}
                    className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Back to Quizzes
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Document Selection & Quiz History */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generate New Quiz */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Generate New Quiz</h2>
              {documents.length === 0 ? (
                <div className="p-8 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                  <p className="text-neutral-500">No processed documents available</p>
                  <p className="text-sm text-neutral-600 mt-2">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.ID}
                      className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{doc.Filename}</p>
                        </div>
                        <button
                          onClick={() => handleGenerateQuiz(doc.ID)}
                          disabled={generating}
                          className="px-4 py-2 bg-neutral-300 text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Generate Quiz
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz History */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Quiz History</h2>
              {quizzes.length === 0 ? (
                <div className="p-8 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                  <p className="text-neutral-500">No quizzes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.ID}
                      className="p-4 bg-neutral-900 rounded-lg border border-neutral-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">
                            {getDocumentName(quiz.DocumentID)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(quiz.CreatedAt).toLocaleDateString()}
                            </span>
                            <span>{quiz.TotalQuestions} questions</span>
                          </div>
                        </div>
                        {quiz.Status === "submitted" && quiz.Score !== undefined && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-500">
                              {quiz.Score.toFixed(0)}%
                            </p>
                          </div>
                        )}
                      </div>
                      {quiz.Status !== "submitted" && (
                        <span className="inline-block px-2 py-1 bg-yellow-900/30 text-yellow-500 text-xs rounded">
                          Not completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}

