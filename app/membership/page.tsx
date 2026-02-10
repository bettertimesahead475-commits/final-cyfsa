export default function Membership() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
        Parent Memberships
      </h1>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[var(--foreground)]">
        <li>{"Basic \u2013 CYFSA + Family Court access"}</li>
        <li>{"Pro \u2013 + Document Analyzer"}</li>
        <li>{"Premium \u2013 + Templates + Voice assistant (later)"}</li>
      </ul>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        {"Payment: Interac e-Transfer (mr.pelkie@gmail.com). No refunds after first use."}
      </p>
    </div>
  )
}
