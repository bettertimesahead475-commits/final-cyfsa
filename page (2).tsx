import AnalyzerWidget from "./analyzer-widget";

export default function Analyzer() {
  return (
    <div className="card">
      <h1>Document Analyzer (Ontario &ndash; Educational Only)</h1>
      <p style={{ opacity: 0.8, fontSize: "0.875rem", marginBottom: 16 }}>
        This tool performs basic educational pattern matching on your text. It is
        not a substitute for legal advice.
      </p>
      <AnalyzerWidget />
    </div>
  );
}
