"use client";
import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
  pdfUrl: string;
  pageNumber: number;
  numPages: number;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function PDFViewer({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onPrevPage,
  onNextPage,
}: PDFViewerProps) {
  return (
    <div className="flex flex-col items-center py-4 lg:py-6 px-2">
      {/* PDF Controls */}
      <div className="mb-4 flex items-center gap-4 bg-neutral-800 px-4 py-2 rounded-lg">
        <button
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={pageNumber >= numPages}
          className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="bg-white rounded-lg shadow-lg">
        <PDFDocument
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
            </div>
          }
          error={
            <div className="p-12 text-center text-red-500">
              Failed to load PDF. The file might not be accessible.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={typeof window !== 'undefined' && window.innerWidth < 1024 ? Math.min(window.innerWidth - 40, 600) : 800}
          />
        </PDFDocument>
      </div>
    </div>
  );
}

