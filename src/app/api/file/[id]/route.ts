import { NextRequest, NextResponse } from "next/server";
import { promises as fs, createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { consumeFile } from "@/lib/jobs";

const MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mkv: "video/x-matroska",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ok: false, code: "INVALID_URL", message: "Token required." }, { status: 401 });
  }

  const file = await consumeFile(id, token);
  if (!file) {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "File not ready or already consumed." },
      { status: 404 },
    );
  }

  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(file.filePath);
  } catch {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "File has expired." },
      { status: 404 },
    );
  }

  const ext = path.extname(file.filePath).replace(".", "") || "mp4";
  const contentType = MIME[ext] ?? "application/octet-stream";
  const asciiName = file.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const headerFilename = `filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`;

  const nodeStream = createReadStream(file.filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

  const response = new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; ${headerFilename}`,
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });

  return response;
}