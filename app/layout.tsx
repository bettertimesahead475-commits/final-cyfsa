import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CYFSA Ontario – Educational Platform",
  description:
    "Educational guidance for CYFSA, Family Court, child impact, document analysis, and lawyer routing. Ontario only. Not legal advice.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="wrap"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <b>CYFSA Ontario – Educational Platform</b>
            <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link href="/">Home</Link>
              <Link href="/cyfsa">CYFSA Guide</Link>
              <Link href="/family-court">Family Court</Link>
              <Link href="/child-development">Child Impact</Link>
              <Link href="/analyzer">Analyzer</Link>
              <Link href="/membership">Membership</Link>
              <Link href="/find-a-lawyer">Find a Lawyer</Link>
              <Link href="/lawyer-spots">Lawyer Spots</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "12px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          Educational only. Ontario jurisdiction only. Not legal advice.
        </footer>
      </body>
    </html>
  )
}
