"use client"

import { useState } from "react"

export default function LawyerOnboard() {
  const [msg, setMsg] = useState("")

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    )
    await fetch("/api/lawyer/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setMsg("Submitted. Status: PENDING (manual activation after payment).")
  }

  return (
    <div className="card">
      <h1>Lawyer Onboarding</h1>
      <form onSubmit={submit} className="grid">
        <input className="input" name="firm" placeholder="Firm" required />
        <input
          className="input"
          name="name"
          placeholder="Lawyer name"
          required
        />
        <input
          className="input"
          name="email"
          placeholder="Email"
          type="email"
          required
        />
        <input className="input" name="city" placeholder="City" required />
        <select name="tier" className="input">
          <option>EXCLUSIVE</option>
          <option>PRIORITY</option>
          <option>STANDARD</option>
        </select>
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
      {msg && <p style={{ marginTop: "12px" }}>{msg}</p>}
      <p style={{ marginTop: "12px", opacity: 0.8 }}>
        Payment: Interac e-Transfer to mr.pelkie@gmail.com
      </p>
    </div>
  )
}
