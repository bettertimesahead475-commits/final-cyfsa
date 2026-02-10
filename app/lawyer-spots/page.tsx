import Link from "next/link"

export default function LawyerSpots() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
        Buy a City Spot (Lawyers)
      </h1>
      <p className="mb-2 leading-relaxed text-[var(--muted-foreground)]">
        Lawyers buy city inventory (monthly). Not a membership.
      </p>
      <p className="mb-4 leading-relaxed text-[var(--muted-foreground)]">
        Pricing returned dynamically after entering city.
      </p>
      <Link
        href="/lawyer-onboard"
        className="inline-block rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
      >
        Request onboarding
      </Link>
    </div>
  )
}
