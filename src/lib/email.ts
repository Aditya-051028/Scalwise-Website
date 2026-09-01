import { Resend } from "resend";
import { LeadConfirmation } from "@/emails/LeadConfirmation";
import { AdminAlert } from "@/emails/AdminAlert";
import type { Lead } from "@/payload-types";
import { readFileSync } from "fs";
import path from "path";
import { PurchaseConfirmation } from "@/emails/PurchaseConfirmation";
import type { Order } from "@/payload-types";

const FROM_ADDRESS = "Scalwise Media <hello@mail.scalwise.online>";
const AI_CASHFLOW_PDF_PATH = path.join(
  process.cwd(),
  "private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf",
);
const SITE_URL = "https://scalwise.online";

let cachedClient: Resend | null | undefined;

function getResendClient(): Resend | null {
  if (cachedClient !== undefined) return cachedClient;
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY not set, skipping email send");
    cachedClient = null;
    return null;
  }
  cachedClient = new Resend(process.env.RESEND_API_KEY);
  return cachedClient;
}

export async function sendLeadConfirmation(lead: Lead): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: lead.email,
    subject: "We've got your message",
    react: LeadConfirmation({ name: lead.name }),
  });
  if (error) {
    console.error("[email] Failed to send lead confirmation:", error);
  }
}

export async function sendAdminAlert(lead: Lead): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (!adminEmail) {
    console.error("[email] ADMIN_ALERT_EMAIL not set, skipping admin alert");
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmail,
    subject: `New lead: ${lead.name}`,
    react: AdminAlert({
      lead,
      adminUrl: `https://scalwise.online/admin/collections/leads/${lead.id}`,
    }),
  });
  if (error) {
    console.error("[email] Failed to send admin alert:", error);
  }
}

// A paid order that never reached its buyer must be visible without tailing
// container logs, so every failure path in sendPurchaseConfirmation (and the
// webhook's order-recording step) routes through here. Plain text on purpose —
// this is an internal ops ping, not a buyer-facing email. Never throws: callers
// are already handling a failure when they call it.
export async function sendOrderDeliveryAlert(details: {
  reason: string;
  orderId?: number | null;
  razorpayPaymentId?: string | null;
}): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) return;
    const adminEmail = process.env.ADMIN_ALERT_EMAIL;
    if (!adminEmail) {
      console.error("[email] ADMIN_ALERT_EMAIL not set, skipping order delivery alert");
      return;
    }
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: "AI Cashflow order needs manual delivery",
      text: [
        details.reason,
        `Order ID: ${details.orderId ?? "not recorded"}`,
        `Razorpay payment ID: ${details.razorpayPaymentId ?? "unknown"}`,
        "Check /admin/collections/orders and deliver the ebook by hand if needed.",
      ].join("\n"),
    });
    if (error) {
      console.error("[email] Failed to send order delivery alert:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send order delivery alert:", err);
  }
}

export async function sendPurchaseConfirmation(order: Order, token: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  if (!order.buyerEmail) {
    console.error("[email] Order has no buyerEmail, skipping purchase confirmation:", order.id);
    return;
  }

  let alertReason: string | null = null;

  // An unreadable PDF must not swallow the whole email — the success-page link in
  // it still gets the buyer to the download route, which is better than nothing.
  let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
  try {
    attachments = [
      {
        filename: "AI-Cashflow.pdf",
        content: readFileSync(AI_CASHFLOW_PDF_PATH),
        contentType: "application/pdf",
      },
    ];
  } catch (err) {
    console.error("[email] Failed to read the AI Cashflow PDF, sending link only:", err);
    alertReason =
      "The AI Cashflow PDF could not be read from disk; the buyer was sent a link-only email.";
  }

  const successUrl = `${SITE_URL}/products/ai-cashflow/success?token=${token}`;
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.buyerEmail,
      subject: "Your AI Cashflow ebook is here",
      react: PurchaseConfirmation({ successUrl }),
      attachments,
    });
    if (error) {
      console.error("[email] Failed to send purchase confirmation:", error);
      alertReason = "The purchase confirmation email was rejected by Resend.";
    }
  } catch (err) {
    console.error("[email] Failed to send purchase confirmation:", err);
    alertReason = "The purchase confirmation email threw while sending.";
  }

  if (alertReason) {
    await sendOrderDeliveryAlert({
      reason: alertReason,
      orderId: order.id,
      razorpayPaymentId: order.razorpayPaymentId,
    });
  }
}
