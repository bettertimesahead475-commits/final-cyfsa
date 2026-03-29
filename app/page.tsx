import { Scale, Shield, BookOpen, AlertCircle } from "lucide-react";
import AnalyzerWidget from "@/components/analyzer-widget";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                CYFSA Document Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                Ontario Parent Education Tool
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 sm:flex">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              Educational Only
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-card/50 to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Understand Your Child Welfare Documents
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Upload or paste CAS documents to identify potential issues like
              hearsay, speculation, and procedural gaps under Ontario&apos;s Child,
              Youth and Family Services Act.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <FeaturePill
              icon={<Shield className="h-4 w-4" />}
              text="Privacy First"
            />
            <FeaturePill
              icon={<BookOpen className="h-4 w-4" />}
              text="CYFSA Focused"
            />
            <FeaturePill
              icon={<Scale className="h-4 w-4" />}
              text="Ontario Specific"
            />
          </div>
        </div>
      </section>

      {/* Analyzer Widget */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <AnalyzerWidget />
        </div>
      </section>

      {/* Disclaimer Footer */}
      <section className="border-t bg-card/30 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-xl border border-muted bg-background/50 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Important Disclaimer
            </h3>
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                This tool is for <strong>educational purposes only</strong> and
                does not constitute legal advice. The analysis provided should not
                be relied upon as a substitute for consultation with a qualified
                family law lawyer.
              </p>
              <p>
                This tool is specific to <strong>Ontario, Canada</strong> and the
                Child, Youth and Family Services Act (CYFSA). Laws and procedures
                differ by jurisdiction.
              </p>
              <p>
                Always consult with a licensed legal professional before taking
                any action based on this analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          <p>
            CYFSA Document Analyzer · Educational Tool · Ontario, Canada
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}
