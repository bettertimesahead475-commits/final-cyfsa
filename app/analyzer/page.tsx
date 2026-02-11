"use client";

import { useState } from "react";

export default function Analyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function analyze() {
    const flags: string[] = [];
    if (/they said|I was told/i.test(text)) flags.push("Hearsay detected");
    if (/without a warrant|no court order/i.test(text))
      flags.push("Possible unauthorized action");
    if (/emergency removal/i.test(text))
      flags.push("Emergency removal referenced");

    setResult(
      JSON.stringify(
        { jurisdiction: "Ontario", educationalOnly: true, flags },
        null,
        2
      )
    );
  }

  return (
    <div className="card">
      <h1>Document Analyzer (Ontario &ndash; Educational Only)</h1>
      <p style={{ opacity: 0.7, marginBottom: 12 }}>
        Paste document text below for an educational analysis of potential CYFSA
        issues.
      </p>
      <textarea
        className="input"
        rows={10}
        placeholder="Paste document text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="btn"
        style={{ marginTop: 12 }}
        onClick={analyze}
      >
        Analyze
      </button>
      {result && (
        <pre
          style={{
            marginTop: 16,
            background: "#0b1220",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #1e2a52",
            overflow: "auto",
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}
