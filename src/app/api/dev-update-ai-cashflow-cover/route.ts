import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

// SCRATCH / one-time-use route — uploads the real 3D book-mockup cover and
// points the AI Cashflow product at it, replacing the flat PDF-page cover.
// Same reasoning as the earlier seed route: standalone CLI scripts are
// broken in this environment. Removed immediately after use.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const expectedToken = process.env.DEV_SEED_TOKEN;
  if (!expectedToken || searchParams.get("token") !== expectedToken) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: "ai-cashflow" } },
    limit: 1,
  });
  const product = docs[0];
  if (!product) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  const coverPath = path.join(process.cwd(), "public/ai-cashflow/book-mockup-cover.png");
  const coverBuffer = readFileSync(coverPath);

  const media = await payload.create({
    collection: "media",
    data: { alt: "AI Cashflow — 3D book cover mockup" },
    file: {
      data: coverBuffer,
      mimetype: "image/png",
      name: "ai-cashflow-book-mockup-cover.png",
      size: coverBuffer.length,
    },
  });

  const oldCoverId = typeof product.coverImage === "object" ? product.coverImage?.id : product.coverImage;

  await payload.update({
    collection: "products",
    id: product.id,
    data: { coverImage: media.id },
  });

  if (oldCoverId) {
    await payload.delete({ collection: "media", id: oldCoverId }).catch(() => {});
  }

  return NextResponse.json({ newMediaId: media.id, productId: product.id, deletedOldCoverId: oldCoverId ?? null });
}
