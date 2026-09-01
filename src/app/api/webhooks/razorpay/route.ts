import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPayloadClient } from "@/lib/payload";
import { signDownloadToken } from "@/lib/download-token";
import { sendPurchaseConfirmation, sendOrderDeliveryAlert } from "@/lib/email";
import { AI_CASHFLOW_SLUG } from "@/lib/content/ai-cashflow";
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

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof parsedBody !== "object" || parsedBody === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const body = parsedBody as RazorpayPaymentLinkPaidPayload;

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

  // razorpayPaymentLinkId is reusable across products, but everything downstream of
  // here (the PDF, the email copy, the success-page link) is AI Cashflow specific —
  // so refuse to deliver rather than send the wrong product to a future buyer.
  if (product.slug !== AI_CASHFLOW_SLUG) {
    console.error(
      "[webhooks/razorpay] Payment link maps to an unsupported product, skipping delivery:",
      product.slug,
    );
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

  // The idempotency check above already passed, so a throw anywhere between here and
  // the minted token would leave Razorpay's retry seeing an existing Order and exiting
  // early — the buyer's email would then never be attempted again. Swallow the failure
  // into a 200 (a retry can't fix an unset secret or a rejected row anyway) and make it
  // an admin's problem instead of a silent one.
  let order: Order;
  let token: string;
  try {
    order = (await payloadClient.create({
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

    token = signDownloadToken(String(order.id));
  } catch (err) {
    console.error(
      "[webhooks/razorpay] Failed to record the order or mint its download token for payment:",
      payment.id,
      err,
    );
    sendOrderDeliveryAlert({
      reason: "Recording the order or minting its download token failed; no email was sent.",
      razorpayPaymentId: payment.id,
    }).catch((alertErr) =>
      console.error("[webhooks/razorpay] admin alert failed:", alertErr),
    );
    return NextResponse.json({ received: true });
  }

  sendPurchaseConfirmation(order, token).catch((err) =>
    console.error("[webhooks/razorpay] confirmation email failed:", err),
  );

  return NextResponse.json({ received: true });
}
