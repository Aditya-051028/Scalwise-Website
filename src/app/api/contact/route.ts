import { NextResponse } from "next/server";
import { ValidationError, type RequiredDataFromCollectionSlug } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { isRateLimited } from "@/lib/rate-limit";
import { isSpamSubmission } from "@/lib/spam-check";
import { sendLeadConfirmation, sendAdminAlert } from "@/lib/email";
import { FORM_SOURCES, CONTACT_FORM_SOURCE, NEWSLETTER_FORM_SOURCE, type FormSource } from "@/lib/form-sources";

// Only fields the real forms send are writable through this public endpoint —
// everything else (status, source/UTM group) is staff-managed via the admin panel.
const ALLOWED_LEAD_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "businessType",
  "interestedServices",
  "monthlyAdBudget",
  "message",
  "preferredContactMethod",
] as const;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const website = typeof body.website === "string" ? body.website : "";
  // A missing timestamp is treated as an instant (spam-like) submission, not a free pass —
  // omitting the field entirely is exactly what a bot posting straight to this route would do.
  const formRenderedAt = typeof body.formRenderedAt === "number" ? body.formRenderedAt : Date.now();
  const formSource: FormSource = FORM_SOURCES.includes(body.formSource)
    ? body.formSource
    : CONTACT_FORM_SOURCE;

  if (isSpamSubmission({ website, formRenderedAt })) {
    return NextResponse.json(
      { doc: null, message: "Lead successfully created." },
      { status: 201 },
    );
  }

  const leadData: Record<string, unknown> = {};
  for (const field of ALLOWED_LEAD_FIELDS) {
    if (body[field] !== undefined) leadData[field] = body[field];
  }

  let lead;
  try {
    const payload = await getPayloadClient();
    lead = await payload.create({
      collection: "leads",
      data: { ...leadData, formSource } as RequiredDataFromCollectionSlug<"leads">,
      overrideAccess: true,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/contact] Failed to create lead:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (lead.formSource !== NEWSLETTER_FORM_SOURCE) {
    sendLeadConfirmation(lead).catch((err) =>
      console.error("[api/contact] confirmation email failed:", err),
    );
    sendAdminAlert(lead).catch((err) =>
      console.error("[api/contact] admin alert failed:", err),
    );
  }

  return NextResponse.json({ doc: lead, message: "Lead successfully created." }, { status: 201 });
}
