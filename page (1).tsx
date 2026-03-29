"use client";

import { useState, useCallback } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface AnalysisResult {
  jurisdiction: string;
  educationalOnly: boolean;
  flags: string[];
  summary: string;
}

const PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /they said|I was told|someone mentioned/i, label: "Hearsay detected" },
  { regex: /I think|I believe|it seems|it appears/i, label: "Speculation detected" },
  { regex: /no affidavit|without affidavit|missing affidavit/i, label: "Missing affidavit reference" },
  { regex: /always|never|every time|constantly/i, label: "Unsupported absolute claim" },
  { regex: /no notice|without notice|wasn't informed|were not notified/i, label: "Possible procedural gap: notice" },
  { regex: /emergency removal|apprehension|removed the child/i, label: "Emergency removal referenced" },
  { regex: /without (a )?warrant|no warrant/i, label: "Warrant concern flagged" },
  { regex: /best interest|child's best/i, label: "Best interest standard referenced" },
];

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += `\n${pageText}`;
  }

  return fullText.trim();
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".md")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".json")) {
    const raw = await file.text();
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw.trim();
    }
  }

  if (name.endsWith(".csv")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".html") || name.endsWith(".htm")) {
    const raw = await file.text();
    return raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (name.endsWith(".docx")) {
    return await extractDocxText(file);
  }

  if (name.endsWith(".pdf")) {
    return await extractPdfText(file);
  }

  throw new Error(
    "Unsupported file type. Supported: txt, md, json, csv, html, htm, docx, pdf."
  );
}

export default function AnalyzerWidget() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setResult(null);

    try {
      const content = await extractTextFromFile(file);
      setText(content);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not read this file.";
      setError(message);
      setText("");
    }
  }, []);

  const analyze = useCallback(() => {
    if (!text.trim()) return;

    const flags: string[] = [];

    for (const { regex, label } of PATTERNS) {
      if (regex.test(text)) flags.push(label);
    }

    if (flags.length === 0) {
      flags.push("No common issues detected in the provided text.");
    }

    setResult({
      jurisdiction: "Ontario",
      educationalOnly: true,
      flags,
      summary: `Analyzed ${text.length} characters. Found ${flags.length} flag(s).`,
    });
  }, [text]);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="file-upload"
          style={{ display: "block", marginBottom: 8, fontSize: "0.875rem", opacity: 0.8 }}
        >
          Upload a document or paste text below:
        </label>

        <input
          id="file-upload"
          type="file"
          accept=".txt,.md,.json,.csv,.html,.htm,.docx,.pdf,text/plain,text/markdown,application/json,text/csv,text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFile}
          style={{ marginBottom: 8 }}
        />

        {fileName && (
          <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            Loaded: {fileName}
          </span>
        )}

        {error && (
          <div style={{ marginTop: 8, color: "#ffb4b4", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}
      </div>

      <textarea
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste document text here..."
        style={{ minHeight: 220, marginBottom: 12, resize: "vertical" }}
      />

      <button className="btn" onClick={analyze} disabled={!text.trim()}>
        Analyze
      </button>

      {result && (
        <pre
          style={{
            marginTop: 16,
            background: "#0b1220",
            border: "1px solid #1e2a52",
            borderRadius: 10,
            padding: 16,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}