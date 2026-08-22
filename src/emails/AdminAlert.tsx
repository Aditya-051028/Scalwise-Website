import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { Lead } from "@/payload-types";

type AdminAlertProps = {
  lead: Lead;
  adminUrl: string;
};

const detailStyle = { color: "#333333", fontSize: "14px", lineHeight: "1.6", margin: "4px 0" };

export function AdminAlert({ lead, adminUrl }: AdminAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>New lead: {lead.name}</Preview>
      <Body style={{ backgroundColor: "#F7F4FC", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "32px", maxWidth: "560px" }}>
          <Heading style={{ color: "#12051F" }}>New lead: {lead.name}</Heading>
          <Section>
            <Text style={detailStyle}><strong>Email:</strong> {lead.email}</Text>
            {lead.phone ? <Text style={detailStyle}><strong>Phone:</strong> {lead.phone}</Text> : null}
            {lead.company ? <Text style={detailStyle}><strong>Company:</strong> {lead.company}</Text> : null}
            {lead.businessType ? (
              <Text style={detailStyle}><strong>Business type:</strong> {lead.businessType}</Text>
            ) : null}
            {lead.interestedServices?.length ? (
              <Text style={detailStyle}>
                <strong>Interested in:</strong> {lead.interestedServices.join(", ")}
              </Text>
            ) : null}
            {lead.monthlyAdBudget ? (
              <Text style={detailStyle}><strong>Monthly ad budget:</strong> {lead.monthlyAdBudget}</Text>
            ) : null}
            <Text style={detailStyle}>
              <strong>Preferred contact:</strong> {lead.preferredContactMethod}
            </Text>
            {lead.message ? <Text style={detailStyle}><strong>Message:</strong> {lead.message}</Text> : null}
          </Section>
          <Text>
            <Link href={adminUrl} style={{ color: "#5B21B6" }}>View in admin →</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminAlert;
