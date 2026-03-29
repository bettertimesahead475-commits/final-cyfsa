"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzerResult, FileType, FlagType } from "@/lib/analyzer/types";
import { SEVERITY_CONFIG, RISK_CONFIG, FLAG_LABELS } from "@/lib/analyzer/types";
import { AnalysisResults } from "./analysis-results";

export default function AnalyzerWidget() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<string>("txt");
  const [source, setSource] = useState<"upload" | "paste">("paste");
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setFileType(getFileType(file));
    setSource("upload");
    setError(null);
    setResult(null);

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      return;
    }

    setText(
      `[File: ${file.name}] Uploaded. Paste extracted document text below to analyze.`
    );
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      if (!fileName) {
        setSource("paste");
        setFileType("txt");
      }
    },
    [fileName]
  );

  const analyze = useCallback(async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fileName: fileName || "pasted-text.txt",
          fileType,
          source,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [text, fileName, fileType, source]);

  const clearAll = useCallback(() => {
    setText("");
    setFileName("");
    setFileType("txt");
    setSource("paste");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={loading}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="mb-2 text-lg font-medium text-foreground">
            Drop your document here or click to upload
          </p>
          <p className="text-sm text-muted-foreground">
            Supports TXT, PDF, DOC, DOCX, and images
          </p>
          {fileName && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label
          htmlFor="document-text"
          className="text-sm font-medium text-muted-foreground"
        >
          Or paste your document text below:
        </label>
        <textarea
          id="document-text"
          value={text}
          onChange={handleTextChange}
          placeholder="Paste CAS/child welfare document text here for analysis..."
          className={cn(
            "min-h-[240px] w-full resize-y rounded-xl border bg-card p-4",
            "text-foreground placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-colors"
          )}
          disabled={loading}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{text.length.toLocaleString()} characters</span>
          {text && (
            <button
              onClick={clearAll}
              className="text-primary hover:underline"
              type="button"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyze}
        disabled={!text.trim() || loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4",
          "bg-primary font-semibold text-primary-foreground",
          "transition-all hover:bg-primary/90",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Document...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Analyze Document
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Analysis Error</p>
            <p className="mt-1 text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && <AnalysisResults result={result} />}
    </div>
  );
}

function getFileType(file: File): string {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".doc")) return "doc";
  if (lower.endsWith(".docx")) return "docx";
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg")
  ) {
    return "image";
  }
  return "txt";
}
