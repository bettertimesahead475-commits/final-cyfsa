"use client"

import { useState } from "react"

export default function LawyerOnboard() {
  const [msg, setMsg] = useState("")

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    await fetch("/api/lawyer/onboard", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setMsg("Submitted. Status: PENDING (manual activation after payment).")
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)]">
        Lawyer Onboarding
      </h1>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          name="firm"
          placeholder="Firm"
          required
        />
        <input
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          name="name"
          placeholder="Lawyer name"
          required
        />
        <input
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          name="city"
          placeholder="City"
          required
        />
        <select
          name="tier"
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        >
          <option>EXCLUSIVE</option>
          <option>PRIORITY</option>
          <option>STANDARD</option>
        </select>
        <button
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          type="submit"
        >
          Submit
        </button>
      </form>
      {msg && (
        <p className="mt-4 text-sm text-[var(--accent)]">{msg}</p>
      )}
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        {"Payment: Interac e-Transfer to mr.pelkie@gmail.com"}
      </p>
    </div>
  )
}
