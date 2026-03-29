"use client";

import { useState, useCallback } from "react";

type Severity = "low" | "medium" | "high";

interface FlagItem {
  key: string;
  label: string;
  severity: Severity;
  count: number;
  excerpts: string[];
}

interface AnalysisResult {
  jurisdiction: string;
  educationalOnly: boolean;
  documentLength: number;
  totalFlags: number;
  flags: FlagItem[];
  notes: string[];
  summary: string;
}

interface PatternGroup {
  key: string;
  label: string;
  severity: Severity;
  regexes: RegExp[];
}

const PATTERNS: PatternGroup[] = [
  {
    key: "hearsay",
    label: "Possible hearsay language",
    severity: "medium",
    regexes: [
      /\b(they said|she said|he said|someone said|worker said|caseworker said)\b/gi,
      /\b(i was told|we were told|i have been told)\b/gi,
      /\b(according to|it was reported|i heard that|i was informed that)\b/gi,
      /\b(someone mentioned|people said|others said)\b/gi,
    ],
  },
  {
    key: "speculation",
    label: "Possible speculation or opinion",
    severity: "medium",
    regexes: [
      /\b(i think|i believe|i feel|it seems|it appears)\b/gi,
      /\b(probably|maybe|perhaps|possibly|likely)\b/gi,
      /\b(i assume|i suspect|i guess)\b/gi,
    ],
  },
  {
    key: "affidavit",
    label: "Possible affidavit or sworn evidence issue",
    severity: "high",
    regexes: [
      /\b(no affidavit|without affidavit|missing affidavit)\b/gi,
      /\b(not sworn|unsworn|not commissioned)\b/gi,
      /\b(no sworn statement|without sworn evidence)\b/gi,
    ],
  },
  {
    key: "absolute_claim",
    label: "Possible unsupported absolute claim",
    severity: "medium",
    regexes: [
      /\b(always|never|every time|constantly|everyone|nobody)\b/gi,
      /\b(completely|totally|all the time)\b/gi,
    ],
  },
  {
    key: "notice",
    label: "Possible procedural gap: notice or service",
    severity: "high",
    regexes: [
      /\b(no notice|without notice|wasn't informed|were not notified|not notified)\b/gi,
      /\b(not served|improper service|never received service)\b/gi,
      /\b(no disclosure|late disclosure|not disclosed)\b/gi,
    ],
  },
  {
    key: "removal",
    label: "Child removal or apprehension reference",
    severity: "high",
    regexes: [
      /\b(emergency removal|apprehension|apprehended)\b/gi,
      /\b(removed the child|child was removed|took the child)\b/gi,
    ],
  },
  {
    key: "warrant",
    label: "Possible warrant or court order issue",
    severity: "high",
    regexes: [
      /\b(without (a )?warrant|no warrant)\b/gi,
      /\b(without court order|without a court order|no court order)\b/gi,
    ],
  },
  {
    key: "best_interests",
    label: "Best interests language detected",
    severity: "low",
    regexes: [
      /\b(best interest|best interests|child's best interests|children's best interests)\b/gi,
      /\b(child's best|child best interest)\b/gi,
    ],
  },
];

function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

function getExcerpt(text: string, start: number, end: number, radius = 60): string {
  const safeStart = Math.max(0, start - radius);
  const safeEnd = Math.min(text.length, end + radius);
  return text.slice(safeStart, safeEnd).trim();
}

function analyzeDocument(rawText: string): AnalysisResult {
  const text = normalizeText(rawText);
  const notes: string[] = [];

  if (!text) {
    return {
      jurisdiction: "Ontario",
      educationalOnly: true,
      documentLength: 0,
      totalFlags: 0,
      flags: [],
      notes: ["No text was provided for analysis."],
      summary: "No analysis completed.",
    };
  }

  const flags: FlagItem[] = [];

  for (const pattern of PATTERNS) {
    let count = 0;
    const excerpts = new Set<string>();

    for (const regex of pattern.regexes) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        count += 1;
        excerpts.add(getExcerpt(text, match.index, match.index + match[0].length));

        if (match.index === regex.lastIndex) {
          regex.lastIndex += 1;
        }
      }
    }

    if (count > 0) {
      flags.push({
        key: pattern.key,
        label: pattern.label,
        severity: pattern.severity,
        count,
        excerpts: Array.from(excerpts).slice(0, 3),
      });
    }
  }

  if (flags.length === 0) {
    notes.push(
      "No pattern-based issues were detected. That does not confirm the document is complete, accurate, or procedurally proper."
    );
  }

  if (text.length < 150) {
    notes.push("Very short text may not contain enough context for useful flagging.");
  }

  const totalFlags = flags.reduce((sum, item) => sum + item.count, 0);

  return {
    jurisdiction: "Ontario",
    educationalOnly: true,
    documentLength: text.length,
    totalFlags,
    flags,
    notes,
    summary:
      flags.length > 0
        ? `Analyzed ${text.length} characters. Detected ${totalFlags} matched references across ${flags.length} categories.`
        : `Analyzed ${text.length} characters. No pattern-based categories were matched.`,
  };
}

export default function AnalyzerWidget() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [warning, setWarning] = useState("");

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setWarning("");

    const lowerName = file.name.toLowerCase();

    if (file.type === "text/plain" || lowerName.endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      return;
    }

    setWarning(
      "This version supports pasted text and .txt files only. PDF, DOCX, and image extraction are not implemented yet."
    );
  }, []);

  const analyze = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setResult(analyzeDocument(trimmed));
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
          accept=".txt,text/plain"
          onChange={handleFile}
          style={{ marginBottom: 8 }}
        />

        {fileName && (
          <div style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 6 }}>
            Loaded: {fileName}
          </div>
        )}

        {warning && (
          <div style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: 6 }}>
            {warning}
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
        <div
          style={{
            marginTop: 16,
            background: "#0b1220",
            border: "1px solid #1e2a52",
            borderRadius: 10,
            padding: 16,
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <strong>Jurisdiction:</strong> {result.jurisdiction}
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Educational only:</strong> {String(result.educationalOnly)}
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Document length:</strong> {result.documentLength} characters
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Total flags:</strong> {result.totalFlags}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Summary:</strong> {result.summary}
          </div>

          {result.notes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <strong>Notes</strong>
              <ul>
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {result.flags.length > 0 ? (
            <div>
              <strong>Detected categories</strong>
              <div style={{ marginTop: 10 }}>
                {result.flags.map((flag) => (
                  <div
                    key={flag.key}
                    style={{
                      border: "1px solid #1e2a52",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                      background: "#0e1730",
                    }}
                  >
                    <div><strong>{flag.label}</strong></div>
                    <div>Severity: {flag.severity}</div>
                    <div>Matches: {flag.count}</div>

                    {flag.excerpts.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Examples</strong>
                        {flag.excerpts.map((excerpt, index) => (
                          <div
                            key={`${flag.key}-${index}`}
                            style={{
                              marginTop: 8,
                              padding: 10,
                              borderRadius: 8,
                              background: "#0b1220",
                              border: "1px solid #1e2a52",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {excerpt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>No flag categories matched in the provided text.</div>
          )}
        </div>
      )}
    </div>
  );
}