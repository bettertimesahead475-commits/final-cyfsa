import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CYFSA Ontario - Educational Platform",
  description:
    "Educational guidance for CYFSA, Family Court, child impact, document analysis, and lawyer routing. Ontario only. Not legal advice.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <b className="text-sm text-[var(--foreground)]">
              CYFSA Ontario &ndash; Educational Platform
            </b>
            <nav className="flex flex-wrap gap-2 text-sm">
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
        <main className="mx-auto max-w-[1100px] px-4 py-4">{children}</main>
        <footer className="border-t border-[var(--border)] px-3 py-3 text-center text-sm text-[var(--muted-foreground)]">
          Educational only. Ontario jurisdiction only. Not legal advice.
        </footer>
      </body>
    </html>
  )
}
