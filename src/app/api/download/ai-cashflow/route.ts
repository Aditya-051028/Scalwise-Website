import { NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { verifyDownloadToken } from "@/lib/download-token";

export const dynamic = "force-dynamic";

const AI_CASHFLOW_PDF_PATH = path.join(
  process.cwd(),
  "private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf",
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const verified = verifyDownloadToken(token);

  if (!verified) {
    return NextResponse.redirect(
      new URL("/products/ai-cashflow?downloadExpired=true", request.url),
    );
  }

  if (!existsSync(AI_CASHFLOW_PDF_PATH)) {
    console.error("[api/download/ai-cashflow] PDF missing on disk:", AI_CASHFLOW_PDF_PATH);
    return NextResponse.json({ error: "File temporarily unavailable" }, { status: 500 });
  }

  const stat = statSync(AI_CASHFLOW_PDF_PATH);
  const webStream = Readable.toWeb(
    createReadStream(AI_CASHFLOW_PDF_PATH),
  ) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AI-Cashflow.pdf"',
      "Content-Length": String(stat.size),
    },
  });
}
