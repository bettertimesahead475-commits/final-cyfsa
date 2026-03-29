"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Scale,
  FileWarning,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzerResult, FlagType } from "@/lib/analyzer/types";
import { SEVERITY_CONFIG, RISK_CONFIG, FLAG_LABELS } from "@/lib/analyzer/types";

interface AnalysisResultsProps {
  result: AnalyzerResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFlag = (id: string) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskConfig = RISK_CONFIG[result.analysis.riskLevel];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-secondary/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Analysis Summary
            </h3>
            <div
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                riskConfig.bgColor,
                riskConfig.color
              )}
            >
              {riskConfig.label}
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="leading-relaxed text-foreground">{result.analysis.summary}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Total Flags</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {result.analysis.totalFlags}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {result.analysis.categoriesDetected.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {result.document.characterCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flags Section */}
      {result.flags.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-secondary/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              Flagged Issues ({result.flags.length})
            </h3>
          </div>
          <div className="divide-y">
            {result.flags.map((flag) => {
              const isExpanded = expandedFlags.has(flag.id);
              const severityConfig = SEVERITY_CONFIG[flag.severity];

              return (
                <div key={flag.id} className="transition-colors hover:bg-secondary/30">
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className="flex w-full items-start gap-4 p-4 text-left"
                  >
                    <div className="mt-0.5">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {flag.label}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-medium",
                            severityConfig.bgColor,
                            severityConfig.color
                          )}
                        >
                          {severityConfig.label}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {FLAG_LABELS[flag.type]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {flag.description}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-secondary/20 px-4 pb-4 pl-14">
                      <div className="space-y-4 pt-4">
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                            Matched Text
                          </h4>
                          <p className="rounded-lg border bg-background p-3 text-sm italic text-foreground">
                            &quot;{flag.matchedText}&quot;
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                            Why Flagged
                          </h4>
                          <p className="text-sm text-foreground">
                            {flag.whyFlagged}
                          </p>
                        </div>
                        {flag.suggestedReview && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                              Suggested Review
                            </h4>
                            <p className="text-sm text-foreground">
                              {flag.suggestedReview}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issue Counts */}
      {Object.keys(result.issueCounts).length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-secondary/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              Issues by Category
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(result.issueCounts)
                .filter(([_, count]) => count && count > 0)
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {FLAG_LABELS[type as FlagType]}
                    </span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.intake.recommendedNextSteps.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-secondary/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Recommended Next Steps
              </h3>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {result.intake.recommendedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ul>
            {result.intake.recommendedForLawyerReview && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <FileWarning className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="font-medium text-amber-400">
                    Lawyer Review Recommended
                  </p>
                  <p className="mt-1 text-sm text-amber-300/80">
                    Based on the analysis, this document may benefit from review
                    by a qualified family law lawyer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JSON Output Toggle */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <button
          onClick={() => setShowJson(!showJson)}
          className="flex w-full items-center justify-between bg-secondary/50 px-6 py-4 text-left"
        >
          <h3 className="text-lg font-semibold text-foreground">
            Structured JSON Output
          </h3>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              showJson && "rotate-180"
            )}
          />
        </button>
        {showJson && (
          <div className="relative p-4">
            <button
              onClick={copyJson}
              className="absolute right-6 top-6 flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <pre className="max-h-96 overflow-auto rounded-lg bg-background p-4 text-xs leading-relaxed text-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-muted bg-secondary/30 p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{result.disclaimer.message}</p>
            <p>{result.disclaimer.notVerifiableMessage}</p>
            <p className="text-xs">
              Analysis generated at{" "}
              {new Date(result.generatedAt).toLocaleString()} · Ontario
              jurisdiction only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
