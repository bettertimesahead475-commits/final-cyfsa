"use client"

import { useState } from "react"

export default function FindLawyer() {
  const [city, setCity] = useState("")

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
        Find a Lawyer
      </h1>
      <input
        className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        placeholder="Enter your city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <p className="mb-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        Pricing + availability returned dynamically by city (to be wired later).
      </p>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        Consent required before sending your info to any lawyer.
      </p>
    </div>
  )
}
