import Link from "next/link"

export default function LawyerSpots() {
  return (
    <div className="card">
      <h1>Buy a City Spot (Lawyers)</h1>
      <p>{"Lawyers buy city inventory (monthly). Not a membership."}</p>
      <p>Pricing returned dynamically after entering city.</p>
      <Link className="btn" href="/lawyer-onboard">
        Request onboarding
      </Link>
    </div>
  )
}
