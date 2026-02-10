"use client";

import { useState } from "react";

export default function FindLawyer() {
  const [city, setCity] = useState("");

  return (
    <div className="card">
      <h1>Find a Lawyer</h1>
      <input
        className="input"
        placeholder="Enter your city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <p>
        Pricing + availability returned dynamically by city (to be wired later).
      </p>
      <p>Consent required before sending your info to any lawyer.</p>
    </div>
  );
}
