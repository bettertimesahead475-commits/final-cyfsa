import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an Ontario child protection law assistant specializing in the Child, Youth and Family Services Act (CYFSA). 
Your role is strictly educational — you help parents understand documents, NOT provide legal advice.

When analyzing a document, respond ONLY with a valid JSON object (no markdown, no preamble) in this exact shape:
{
  "jurisdiction": "Ontario",
  "educationalOnly": true,
  "flags": ["array of specific concerns found in the text"],
  "summary": "2-3 sentence plain-language summary of the document",
  "cyfsaReferences": ["relevant CYFSA sections with brief description, e.g. 'Section 74 – Duty to Report'"],
  "recommendations": ["actionable next steps for the parent, e.g. 'Contact Legal Aid Ontario at 1-800-668-8258'"]
}

Focus on: procedural compliance, rights violations, timelines, hearsay, unauthorized actions, safety plans, and access rights.
Always recommend consulting a lawyer for any legal decisions.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide document text to analyze." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please analyze this Ontario CAS/CYFSA document for educational purposes:\n\n${text.slice(0, 8000)}`,
        },
      ],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```(?:json)?\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
