"use client"

import { useState } from "react"

export default function Analyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<string | null>(null)

  function analyze() {
    const flags: string[] = []
    if (/they said|I was told/i.test(text)) flags.push("Hearsay detected")
    if (/emergency|apprehend/i.test(text))
      flags.push("Emergency removal language detected")
    if (/without (a |my )?consent/i.test(text))
      flags.push("Consent issue flagged")

    setResult(
      JSON.stringify(
        { jurisdiction: "Ontario", educationalOnly: true, flags },
        null,
        2
      )
    )
  }

  return (
    <div className="card">
      <h1>Document Analyzer (Ontario – Educational Only)</h1>
      <p style={{ marginBottom: "12px", opacity: 0.8 }}>
        Paste document text below for an educational analysis against CYFSA
        provisions.
      </p>
      <textarea
        className="input"
        rows={10}
        placeholder="Paste document text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: "12px" }}
      />
      <button className="btn" onClick={analyze}>
        Analyze
      </button>
      {result && (
        <pre
          style={{
            marginTop: "16px",
            background: "var(--background)",
            padding: "12px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            overflowX: "auto",
          }}
        >
          {result}
        </pre>
      )}
    </div>
  )
}
