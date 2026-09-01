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

// The checkout in use (a Razorpay Payment PAGE, id prefix `pl_`) is a different
// product from Razorpay Payment LINKS (`plink_...`) and fires `order.paid` /
// `payment.captured`, not `payment_link.paid` — confirmed against a real
// transaction's payload, which carries no payment-page-identifying field at all.
// With exactly one product live, attribution is by amount match instead of by ID;
// this must be revisited (e.g. distinct amounts, or Payment Page `notes`/receipt
// wiring) before a second product goes on sale through this same webhook.
type RazorpayOrderPaidPayload = {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        email?: string;
        contact?: string;
      };
    };
    order: {
      entity: {
        id: string;
        amount: number;
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
  const body = parsedBody as RazorpayOrderPaidPayload;

  if (body.event !== "order.paid") {
    return NextResponse.json({ received: true });
  }

  const payment = body.payload.payment.entity;
  const buyerEmail = payment.email;
  const buyerContact = payment.contact;

  const payloadClient = await getPayloadClient();

  const { docs: products } = await payloadClient.find({
    collection: "products",
    where: { slug: { equals: AI_CASHFLOW_SLUG } },
    limit: 1,
  });
  const product = products[0];
  if (!product) {
    console.error("[webhooks/razorpay] AI Cashflow product not found in Payload");
    return NextResponse.json({ received: true });
  }

  const expectedAmount = (product.price ?? 0) * 100;
  if (payment.amount !== expectedAmount) {
    console.error(
      "[webhooks/razorpay] Paid amount doesn't match AI Cashflow's price, skipping delivery:",
      { paid: payment.amount, expected: expectedAmount, paymentId: payment.id },
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
        // No Payment Page ID exists in this payload (see note above) — the
        // Razorpay Order ID is stored here instead, for traceability only.
        razorpayPaymentLinkId: body.payload.order.entity.id,
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
