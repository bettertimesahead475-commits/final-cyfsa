import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CYFSA Ontario - Educational Platform",
  description:
    "Educational guidance for CYFSA, Family Court, child impact, document analysis, and lawyer routing. Ontario only. Not legal advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="hdr">
          <div className="wrap">
            <b>CYFSA Ontario &ndash; Educational Platform</b>
            <nav>
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
        <footer className="ftr">
          Educational only. Ontario jurisdiction only. Not legal advice.
        </footer>
      </body>
    </html>
  );
}
