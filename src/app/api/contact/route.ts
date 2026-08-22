import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { isRateLimited } from "@/lib/rate-limit";
import { isSpamSubmission } from "@/lib/spam-check";
import { sendLeadConfirmation, sendAdminAlert } from "@/lib/email";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { website, formRenderedAt, formSource, ...leadData } = body;

  if (isSpamSubmission({ website: website ?? "", formRenderedAt: formRenderedAt ?? 0 })) {
    return NextResponse.json(
      { doc: null, message: "Lead successfully created." },
      { status: 201 },
    );
  }

  let lead;
  try {
    const payload = await getPayloadClient();
    lead = await payload.create({
      collection: "leads",
      data: { ...leadData, formSource },
    });
  } catch (err) {
    console.error("[api/contact] Failed to create lead:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (formSource === "Contact Form") {
    sendLeadConfirmation(lead).catch((err) =>
      console.error("[api/contact] confirmation email failed:", err),
    );
    sendAdminAlert(lead).catch((err) =>
      console.error("[api/contact] admin alert failed:", err),
    );
  }

  return NextResponse.json({ doc: lead, message: "Lead successfully created." }, { status: 201 });
}
