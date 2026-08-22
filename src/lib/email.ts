import { Resend } from "resend";
import { LeadConfirmation } from "@/emails/LeadConfirmation";
import { AdminAlert } from "@/emails/AdminAlert";
import type { Lead } from "@/payload-types";

const FROM_ADDRESS = "Scalwise Media <hello@scalwise.online>";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY not set, skipping email send");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
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
