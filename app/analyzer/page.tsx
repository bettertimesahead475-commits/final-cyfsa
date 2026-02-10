export default function Analyzer() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
        Document Analyzer (Ontario &ndash; Educational Only)
      </h1>
      <iframe
        src="/widget.html"
        className="mt-4 w-full rounded-lg border-0"
        style={{ height: 1100 }}
        title="CYFSA Document Analyzer"
      />
    </div>
  )
}
