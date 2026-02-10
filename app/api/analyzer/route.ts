import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null)

  if (!formData) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with files" },
      { status: 400 }
    )
  }

  const files = formData.getAll("files")

  if (!files.length) {
    return NextResponse.json(
      { error: "No files uploaded" },
      { status: 400 }
    )
  }

  // Educational stub response matching the cyfsa_analyzer_response schema.
  // Replace this with real document analysis logic in production.
  const fileNames = files
    .map((f) => (f instanceof File ? f.name : "unknown"))
    .join(", ")

  return NextResponse.json({
    meta: {
      jurisdiction: "Ontario",
      educationalOnly: true,
      filesReceived: files.length,
      fileNames,
    },
    summary: {
      plain_language:
        `Received ${files.length} file(s) for educational CYFSA analysis: ${fileNames}. ` +
        "This is a stub response. Connect a real analysis backend to generate actual flags and timeline.",
    },
    flags: [],
    timeline: [],
  })
}
