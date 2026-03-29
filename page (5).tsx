import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  firm: z.string().min(1, "Firm is required"),
  name: z.string().min(1, "Lawyer name is required"),
  email: z.string().email("Valid email is required"),
  city: z.string().min(1, "City is required"),
  tier: z.enum(["EXCLUSIVE", "PRIORITY", "STANDARD"]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid request",
      },
      { status: 400 }
    );
  }

  // placeholder for database write
  const record = {
    ...parsed.data,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    ok: true,
    status: "PENDING",
    data: record,
  });
}