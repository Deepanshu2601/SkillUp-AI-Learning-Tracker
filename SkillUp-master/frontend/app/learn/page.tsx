"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Sparkles, Send, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getApiUrl } from "@/lib/api";

// Dynamically import PDF viewer to prevent SSR issues
const PDFViewer = dynamic(() => import("@/components/pdf/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
    </div>
  ),
});

interface Document {
  ID: string;
  UserID: string;
  Filename: string;
  FilePath: string;
  ProcessingStatus: string;
  UploadDate: string;
  Summary?: string;
  SummaryGeneratedAt?: string;
}

interface ChatMessage {
  question: string;
  answer: string;
}

export default function LearnPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docText, setDocText] = useState<string>("");
  const [loadingDocText, setLoadingDocText] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Upload document
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or text document only");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${getApiUrl()}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Document uploaded successfully!");
        fetchDocuments();
      } else {
        alert("Failed to upload document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/documents`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch document text/PDF
  const fetchDocumentText = async (docId: string) => {
    setLoadingDocText(true);
    setPageNumber(1);
    try {
      // Fetch PDF with auth headers
      const response = await fetch(`${getApiUrl()}/api/documents/${docId}/file`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        // Convert to blob and create object URL
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } else {
        setDocText("Failed to load PDF. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setDocText("Error loading document content");
    } finally {
      setLoadingDocText(false);
    }
  };

  // PDF loading callbacks
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;

    setGeneratingSummary(true);
    try {
      const response = await fetch(
        `${getApiUrl()}/api/documents/${selectedDoc.ID}/summarize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            length: "medium",
            style: "paragraph",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedDoc({ ...selectedDoc, Summary: data.summary });
      } else {
        alert("Failed to generate summary");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Error generating summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const question = chatInput;
    setChatInput("");
    setSendingMessage(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/chat/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: question }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages([...chatMessages, { question, answer: data.answer }]);
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle document selection
  const handleSelectDocument = (doc: Document) => {
    // Revoke old blob URL to prevent memory leaks
    if (pdfUrl && pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    setSelectedDoc(doc);
    setChatMessages([]);
    setPdfUrl("");
    fetchDocumentText(doc.ID);
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-950 text-white pt-20 lg:pt-24">
        <div className="flex flex-col lg:flex-row w-full lg:h-[calc(100vh-6rem)]">
        {/* Left Sidebar - Documents List */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col bg-neutral-900/50">
          {/* Upload Section */}
          <div className="p-3 lg:p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Documents
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto min-h-[200px] lg:min-h-0">
            {documents.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-sm">
                No documents yet. Upload one to get started!
              </div>
            ) : (
              <div className="p-2">
                {documents.map((doc) => (
                  <button
                    key={doc.ID}
                    onClick={() => handleSelectDocument(doc)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors mb-2 ${
                      selectedDoc?.ID === doc.ID
                        ? "bg-neutral-800 border border-neutral-700"
                        : "hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{doc.Filename}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(doc.UploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Document Viewer */}
        <div className="flex-1 flex flex-col bg-neutral-950">
          {selectedDoc ? (
            <>
              {/* Document Header */}
              <div className="p-3 lg:p-4 border-b border-neutral-800 bg-neutral-900/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedDoc.Filename}</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Uploaded: {new Date(selectedDoc.UploadDate).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Cleanup blob URL
                      if (pdfUrl && pdfUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(pdfUrl);
                      }
                      setSelectedDoc(null);
                      setDocText("");
                      setPdfUrl("");
                      setChatMessages([]);
                    }}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto bg-neutral-900/30 min-h-[400px] lg:min-h-0">
                {loadingDocText ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
                  </div>
                ) : pdfUrl ? (
                  <PDFViewer
                    pdfUrl={pdfUrl}
                    pageNumber={pageNumber}
                    numPages={numPages}
                    onDocumentLoadSuccess={onDocumentLoadSuccess}
                    onPrevPage={goToPrevPage}
                    onNextPage={goToNextPage}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-neutral-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                      <p>Document preview not available</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-700" />
                <p className="text-neutral-500 text-lg">Select a document to view</p>
                <p className="text-neutral-600 text-sm mt-2">
                  Choose from the list or upload a new document
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Summary & Chat */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-neutral-800 flex flex-col bg-neutral-900/50">
          {selectedDoc ? (
            <>
              {/* Summary Section */}
              <div className="p-3 lg:p-4 border-b border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Document Summary</h3>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {generatingSummary ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {selectedDoc.Summary ? (
                    <p className="text-neutral-300 text-xs leading-relaxed">
                      {selectedDoc.Summary}
                    </p>
                  ) : (
                    <p className="text-neutral-600 text-xs italic">
                      No summary yet. Click generate to create one.
                    </p>
                  )}
                </div>
              </div>

              {/* Chat Section */}
              <div className="flex-1 flex flex-col p-3 lg:p-4 min-h-[300px] lg:min-h-0">
                <h3 className="font-semibold text-sm mb-3">Chat with Document</h3>
                
                {/* Chat Messages */}
                <div className="flex-1 space-y-3 mb-3 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-neutral-600 text-xs italic text-center mt-8">
                      Ask questions about your document...
                    </p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="bg-neutral-800/50 rounded-lg p-2.5">
                          <p className="text-xs font-medium text-neutral-400 mb-1">You:</p>
                          <p className="text-xs text-neutral-300">{msg.question}</p>
                        </div>
                        <div className="bg-neutral-700/50 rounded-lg p-2.5">
                          <p className="text-xs font-medium text-neutral-400 mb-1">AI:</p>
                          <p className="text-xs text-neutral-200 leading-relaxed">{msg.answer}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 bg-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !chatInput.trim()}
                    className="px-3 py-2 bg-neutral-300 text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-neutral-600 text-sm text-center">
                Select a document to view summary and chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

