import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ok: false, code: "INVALID_URL", message: "Token required." }, { status: 401 });
  }

  const snapshot = getJob(id, token);
  if (!snapshot) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND", message: "Job not found or token invalid." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...snapshot });
}