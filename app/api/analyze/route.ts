import { generateObject } from "ai";
import { z } from "zod";
import { AnalyzeRequestSchema, AnalyzerFlagSchema } from "@/lib/analyzer/schema";
import type { AnalyzerResult, FlagType, FileType } from "@/lib/analyzer/types";

const AnalysisResponseSchema = z.object({
  summary: z.string().describe("A brief summary of the document and issues found"),
  riskLevel: z.enum(["low", "medium", "high"]).describe("Overall risk level based on issues found"),
  flags: z.array(
    z.object({
      type: z.enum([
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
      ]).describe("Type of issue detected"),
      severity: z.enum(["low", "medium", "high"]).describe("Severity of this specific issue"),
      label: z.string().describe("Human-readable label for the flag"),
      description: z.string().describe("Detailed description of the issue"),
      matchedText: z.string().describe("The exact text that triggered this flag"),
      whyFlagged: z.string().describe("Explanation of why this was flagged"),
      suggestedReview: z.string().optional().describe("Suggested action for review"),
    })
  ).describe("List of issues found in the document"),
  recommendedNextSteps: z.array(z.string()).describe("Recommended educational next steps"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { text, fileName, fileType, source } = parsed.data;

    const systemPrompt = `You are a legal document analyzer specializing in Ontario Child, Youth and Family Services Act (CYFSA) cases. Your role is to identify potential issues in child welfare documents for educational purposes only.

IMPORTANT DISCLAIMERS:
- This is for educational purposes only
- This is NOT legal advice
- Parents should always consult with a qualified lawyer
- Analysis is specific to Ontario jurisdiction

When analyzing documents, look for:
1. HEARSAY - Statements based on what someone else said without direct knowledge
2. SPECULATION - Uncertain or inferential wording without evidence
3. MISSING AFFIDAVIT REFERENCE - Claims that should be supported by sworn evidence
4. UNSUPPORTED CLAIMS - Assertions without factual basis
5. PROCEDURAL GAP - Missing procedural steps or documentation
6. WARRANT CONCERN - Issues related to warrants or court orders
7. BEST INTEREST REFERENCE - References to child's best interests that may need scrutiny
8. EMERGENCY REMOVAL REFERENCE - Emergency removal procedures that may be questionable
9. NOTICE ISSUE - Problems with proper notice or service

Analyze the text carefully and identify specific passages that match these patterns. Be specific about what text triggered each flag and why it matters under CYFSA.`;

    const { object: analysisResult } = await generateObject({
      model: "anthropic/claude-opus-4",
      system: systemPrompt,
      prompt: `Analyze the following document text for potential issues under Ontario CYFSA. Identify specific problematic passages and explain why they may be concerning from an educational perspective.

Document text:
${text}`,
      schema: AnalysisResponseSchema,
    });

    // Build the full result object
    const categoriesDetected = [
      ...new Set(analysisResult.flags.map((f) => f.type)),
    ] as FlagType[];

    const issueCounts: Partial<Record<FlagType, number>> = {};
    for (const flag of analysisResult.flags) {
      issueCounts[flag.type as FlagType] = (issueCounts[flag.type as FlagType] || 0) + 1;
    }

    const result: AnalyzerResult = {
      schemaVersion: "1.1.0",
      tool: "cyfsa-document-analyzer",
      jurisdiction: "Ontario",
      educationalOnly: true,
      document: {
        fileName: fileName || "pasted-text.txt",
        fileType: normalizeFileType(fileType),
        source,
        textExtracted: true,
        ocrUsed: false,
        language: "en",
        characterCount: text.length,
      },
      analysis: {
        summary: analysisResult.summary,
        riskLevel: analysisResult.riskLevel,
        totalFlags: analysisResult.flags.length,
        categoriesDetected,
      },
      flags: analysisResult.flags.map((flag, index) => ({
        id: `flag-${String(index + 1).padStart(3, "0")}`,
        type: flag.type as FlagType,
        severity: flag.severity,
        label: flag.label,
        description: flag.description,
        matchedText: flag.matchedText,
        whyFlagged: flag.whyFlagged,
        suggestedReview: flag.suggestedReview,
      })),
      issueCounts,
      intake: {
        recommendedForLawyerReview: analysisResult.riskLevel !== "low",
        recommendedNextSteps: analysisResult.recommendedNextSteps,
        consentRequiredBeforeSharing: true,
      },
      disclaimer: {
        message:
          "Educational only. Not legal advice. Not a substitute for independent legal advice.",
        notVerifiableMessage: "Not verifiable from primary sources.",
      },
      generatedAt: new Date().toISOString(),
    };

    return Response.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "Failed to analyze document. Please try again." },
      { status: 500 }
    );
  }
}

function normalizeFileType(type: string): FileType {
  const lower = type.toLowerCase();
  if (lower === "pdf") return "pdf";
  if (lower === "docx" || lower === "doc") return "docx";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(lower)) return "image";
  if (lower === "html") return "html";
  if (lower === "json") return "json";
  if (lower === "csv") return "csv";
  if (lower === "txt") return "txt";
  return "unknown";
}
