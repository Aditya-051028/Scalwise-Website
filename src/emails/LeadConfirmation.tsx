import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

type LeadConfirmationProps = {
  name: string;
};

export function LeadConfirmation({ name }: LeadConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Thanks for reaching out to Scalwise Media</Preview>
      <Body style={{ backgroundColor: "#F7F4FC", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ color: "#12051F" }}>Got it, {name}.</Heading>
          <Text style={{ color: "#333333", fontSize: "15px", lineHeight: "1.6" }}>
            Thanks for reaching out to Scalwise Media. We&rsquo;ve received your message and
            will get back to you shortly.
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", lineHeight: "1.6" }}>
            — The Scalwise Media team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadConfirmation;
