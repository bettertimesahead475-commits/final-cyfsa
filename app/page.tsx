export default function Home() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
        CYFSA Ontario &ndash; Parent Education Platform
      </h1>
      <p className="mb-4 leading-relaxed text-[var(--muted-foreground)]">
        Educational guidance for CYFSA, Family Court, child impact, document
        analysis, and lawyer routing. Ontario only. Not legal advice.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-[var(--foreground)]">
        <li>Parent education + templates</li>
        <li>Document analyzer (educational)</li>
        <li>Find a lawyer by city (paid spots)</li>
      </ul>
    </div>
  )
}
