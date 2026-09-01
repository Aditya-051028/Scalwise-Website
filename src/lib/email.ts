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

export async function sendPurchaseConfirmation(order: Order, token: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  if (!order.buyerEmail) {
    console.error("[email] Order has no buyerEmail, skipping purchase confirmation:", order.id);
    return;
  }
  try {
    const pdfBuffer = readFileSync(AI_CASHFLOW_PDF_PATH);
    const successUrl = `${SITE_URL}/products/ai-cashflow/success?token=${token}`;
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.buyerEmail,
      subject: "Your AI Cashflow ebook is here",
      react: PurchaseConfirmation({ successUrl }),
      attachments: [
        { filename: "AI-Cashflow.pdf", content: pdfBuffer, contentType: "application/pdf" },
      ],
    });
    if (error) {
      console.error("[email] Failed to send purchase confirmation:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send purchase confirmation:", err);
  }
}
