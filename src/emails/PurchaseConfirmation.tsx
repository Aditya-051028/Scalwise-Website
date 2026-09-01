import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

type PurchaseConfirmationProps = {
  successUrl: string;
};

export function PurchaseConfirmation({ successUrl }: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your AI Cashflow ebook is attached</Preview>
      <Body style={{ backgroundColor: "#F7F4FC", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ color: "#12051F" }}>You&rsquo;re in.</Heading>
          <Text style={{ color: "#333333", fontSize: "15px", lineHeight: "1.6" }}>
            Thanks for grabbing AI Cashflow — the full 83-page ebook is attached to this email
            as a PDF, ready to open right now.
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", lineHeight: "1.6" }}>
            You can also view your order and re-download it any time from the link below.
          </Text>
          <Button
            href={successUrl}
            style={{
              backgroundColor: "#12051F",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "9999px",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            View your order
          </Button>
          <Text style={{ color: "#333333", fontSize: "15px", lineHeight: "1.6", marginTop: "24px" }}>
            — The Scalwise Media team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PurchaseConfirmation;
