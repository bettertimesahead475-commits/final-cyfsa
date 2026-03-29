export type FlagType =
  | "hearsay"
  | "speculation"
  | "missing_affidavit_reference"
  | "unsupported_claim"
  | "procedural_gap"
  | "warrant_concern"
  | "best_interest_reference"
  | "emergency_removal_reference"
  | "notice_issue"
  | "other";

export type Severity = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type FileType =
  | "txt"
  | "pdf"
  | "docx"
  | "image"
  | "html"
  | "json"
  | "csv"
  | "unknown";

export interface AnalyzerFlag {
  id: string;
  type: FlagType;
  severity: Severity;
  label: string;
  description: string;
  matchedText: string;
  startIndex?: number;
  endIndex?: number;
  page?: number;
  sourceSection?: string;
  whyFlagged: string;
  suggestedReview?: string;
}

export interface AnalyzerResult {
  schemaVersion: string;
  tool: "cyfsa-document-analyzer";
  jurisdiction: "Ontario";
  educationalOnly: true;
  document: {
    fileName?: string;
    fileType: FileType;
    source: "upload" | "paste";
    textExtracted: boolean;
    ocrUsed: boolean;
    language?: string;
    characterCount: number;
    pageCount?: number;
  };
  analysis: {
    summary: string;
    riskLevel: RiskLevel;
    confidence?: number;
    totalFlags: number;
    categoriesDetected: FlagType[];
  };
  flags: AnalyzerFlag[];
  issueCounts: Partial<Record<FlagType, number>>;
  intake: {
    recommendedForLawyerReview: boolean;
    recommendedNextSteps: string[];
    consentRequiredBeforeSharing: true;
  };
  disclaimer: {
    message: string;
    notVerifiableMessage: string;
  };
  generatedAt: string;
}

export interface AnalyzeRequest {
  text: string;
  fileName?: string;
  fileType: string;
  source: "upload" | "paste";
}

export const FLAG_LABELS: Record<FlagType, string> = {
  hearsay: "Hearsay",
  speculation: "Speculation",
  missing_affidavit_reference: "Missing Affidavit Reference",
  unsupported_claim: "Unsupported Claim",
  procedural_gap: "Procedural Gap",
  warrant_concern: "Warrant Concern",
  best_interest_reference: "Best Interest Reference",
  emergency_removal_reference: "Emergency Removal Reference",
  notice_issue: "Notice Issue",
  other: "Other",
};

export const SEVERITY_CONFIG: Record<
  Severity,
  { color: string; bgColor: string; label: string }
> = {
  low: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    label: "Low",
  },
  medium: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    label: "Medium",
  },
  high: {
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    label: "High",
  },
};

export const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; bgColor: string; label: string }
> = {
  low: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    label: "Low Risk",
  },
  medium: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    label: "Medium Risk",
  },
  high: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    label: "High Risk",
  },
};
