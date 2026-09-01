import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPayloadClient } from "@/lib/payload";
import { signDownloadToken } from "@/lib/download-token";
import { sendPurchaseConfirmation } from "@/lib/email";
import type { RequiredDataFromCollectionSlug } from "payload";
import type { Order } from "@/payload-types";

function isValidSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/razorpay] RAZORPAY_WEBHOOK_SECRET not set");
    return false;
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

type RazorpayPaymentLinkPaidPayload = {
  event: string;
  payload: {
    payment_link: {
      entity: {
        id: string;
        customer?: { email?: string; contact?: string };
      };
    };
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        email?: string;
        contact?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: RazorpayPaymentLinkPaidPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.event !== "payment_link.paid") {
    return NextResponse.json({ received: true });
  }

  const paymentLinkId = body.payload.payment_link.entity.id;
  const payment = body.payload.payment.entity;
  const buyerEmail = payment.email || body.payload.payment_link.entity.customer?.email;
  const buyerContact = payment.contact || body.payload.payment_link.entity.customer?.contact;

  const payloadClient = await getPayloadClient();

  const { docs: products } = await payloadClient.find({
    collection: "products",
    where: { razorpayPaymentLinkId: { equals: paymentLinkId } },
    limit: 1,
  });
  const product = products[0];
  if (!product) {
    console.error("[webhooks/razorpay] No product found for payment link:", paymentLinkId);
    return NextResponse.json({ received: true });
  }

  const { docs: existingOrders } = await payloadClient.find({
    collection: "orders",
    where: { razorpayPaymentId: { equals: payment.id } },
    limit: 1,
  });
  if (existingOrders.length > 0) {
    return NextResponse.json({ received: true });
  }

  const order = (await payloadClient.create({
    collection: "orders",
    data: {
      razorpayPaymentId: payment.id,
      razorpayPaymentLinkId: paymentLinkId,
      product: product.id,
      amount: payment.amount,
      currency: payment.currency,
      buyerEmail,
      buyerContact,
      rawPayload: body,
    } as RequiredDataFromCollectionSlug<"orders">,
    overrideAccess: true,
  })) as Order;

  const token = signDownloadToken(String(order.id));
  sendPurchaseConfirmation(order, token).catch((err) =>
    console.error("[webhooks/razorpay] confirmation email failed:", err),
  );

  return NextResponse.json({ received: true });
}
