import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

// SCRATCH / one-time-use route — creates the real AI Cashflow product + cover
// media via the Local API, since the standalone CLI script path is broken in
// this environment (confirmed pre-existing, affects the project's own
// seed.ts too). Token-protected via an env var (never committed) since it
// has to be deployed briefly to run against production; removed (and
// redeployed without it) immediately after use, not part of the shipped
// feature.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const expectedToken = process.env.DEV_SEED_TOKEN;
  if (!expectedToken || searchParams.get("token") !== expectedToken) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payload = await getPayloadClient();

  const existing = await payload.count({
    collection: "products",
    where: { slug: { equals: "ai-cashflow" } },
  });
  if (existing.totalDocs > 0) {
    return NextResponse.json({ message: "already exists" });
  }

  const coverPath = path.join(process.cwd(), "public/ai-cashflow/cover.png");
  const coverBuffer = readFileSync(coverPath);

  const media = await payload.create({
    collection: "media",
    data: { alt: "AI Cashflow ebook cover" },
    file: {
      data: coverBuffer,
      mimetype: "image/png",
      name: "ai-cashflow-cover.png",
      size: coverBuffer.length,
    },
  });

  const product = await payload.create({
    collection: "products",
    data: {
      title: "AI Cashflow",
      slug: "ai-cashflow",
      productType: "E-book",
      status: "Coming Soon",
      featured: true,
      coverImage: media.id,
      shortDescription:
        "Build Your First Online Income Stream Using AI, Content & Social Media — even if you're starting from zero, with zero budget.",
      currency: "INR",
      order: 0,
    },
  });

  return NextResponse.json({ mediaId: media.id, productId: product.id });
}
