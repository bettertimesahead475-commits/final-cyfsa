"use client";

import { useState, useCallback } from "react";

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

export default function AnalyzerWidget() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type === "text/plain") {
      const content = await file.text();
      setText(content);
    } else {
      setText(`[File selected: ${file.name}] — Only plain text (.txt) is supported in this educational demo. Paste your document text below instead.`);
    }
  }, []);

  const analyze = useCallback(() => {
    if (!text.trim()) return;

    const flags: string[] = [];
    for (const { regex, label } of PATTERNS) {
      if (regex.test(text)) {
        flags.push(label);
      }
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
          Upload a .txt file or paste your document text below:
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFile}
          style={{ marginBottom: 8 }}
        />
        {fileName && (
          <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            {" "}Loaded: {fileName}
          </span>
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
