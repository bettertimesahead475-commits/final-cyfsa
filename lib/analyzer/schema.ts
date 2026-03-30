import { z } from "zod";

const FlagTypeSchema = z.enum([
  "hearsay",
  "speculation",
  "missing_affidavit_reference",
  "unsupported_claim",
  "procedural_gap",
  "warrant_concern",
  "best_interest_reference",
  "emergency_removal_reference",
  "notice_issue",
  "other",
]);

const SeveritySchema = z.enum(["low", "medium", "high"]);
const RiskLevelSchema = z.enum(["low", "medium", "high"]);
const FileTypeSchema = z.enum([
  "txt",
  "pdf",
  "docx",
  "image",
  "html",
  "json",
  "csv",
  "unknown",
]);

export const AnalyzerFlagSchema = z.object({
  id: z.string(),
  type: FlagTypeSchema,
  severity: SeveritySchema,
  label: z.string(),
  description: z.string(),
  matchedText: z.string(),
  startIndex: z.number().int().nonnegative().optional(),
  endIndex: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  sourceSection: z.string().optional(),
  whyFlagged: z.string(),
  suggestedReview: z.string().optional(),
});

export const AnalyzerResultSchema = z.object({
  schemaVersion: z.string(),
  tool: z.literal("cyfsa-document-analyzer"),
  jurisdiction: z.literal("Ontario"),
  educationalOnly: z.literal(true),
  document: z.object({
    fileName: z.string().optional(),
    fileType: FileTypeSchema,
    source: z.enum(["upload", "paste"]),
    textExtracted: z.boolean(),
    ocrUsed: z.boolean(),
    language: z.string().optional(),
    characterCount: z.number().int().nonnegative(),
    pageCount: z.number().int().positive().optional(),
  }),
  analysis: z.object({
    summary: z.string(),
    riskLevel: RiskLevelSchema,
    confidence: z.number().min(0).max(1).optional(),
    totalFlags: z.number().int().nonnegative(),
    categoriesDetected: z.array(FlagTypeSchema),
  }),
  flags: z.array(AnalyzerFlagSchema),
  issueCounts: z.record(z.string(), z.number().int().nonnegative()).optional(),
  intake: z.object({
    recommendedForLawyerReview: z.boolean(),
    recommendedNextSteps: z.array(z.string()),
    consentRequiredBeforeSharing: z.literal(true),
  }),
  disclaimer: z.object({
    message: z.string(),
    notVerifiableMessage: z.string(),
  }),
  generatedAt: z.string(),
});

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1, "Document text is required"),
  fileName: z.string().optional(),
  fileType: z.string(),
  source: z.enum(["upload", "paste"]),
});
