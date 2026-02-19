import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.email || !body?.city || !body?.tier) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // In a real implementation, this would save to a database
  return NextResponse.json({ ok: true, status: "PENDING" });
}
