# AI Cashflow Payment Verification & Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the AI Cashflow payment-verification and delivery gap: a Razorpay webhook records real orders, mints a signed download link, emails the buyer the PDF directly, and the existing `success` page + a new download route serve as the durable backup/resend surface.

**Architecture:** A `payment_link.paid` Razorpay webhook (signature-verified, idempotent) creates a Payload `Orders` record and fires a Resend email with the PDF attached plus a signed link back to the site. That signed token (HMAC via Node's built-in `crypto`, no new dependency) is the single mechanism gating both the rewritten `success` page and a new `/api/download/ai-cashflow` route that streams the PDF from a private, gitignored path on disk.

**Tech Stack:** Next.js 15 App Router route handlers, Payload CMS (Postgres adapter, Local API), Resend + React Email (both already integrated for lead emails), Node built-in `crypto`/`fs`/`stream`. No new npm dependencies.

**Spec:** [`docs/superpowers/specs/2026-09-01-ai-cashflow-payment-verification-design.md`](../specs/2026-09-01-ai-cashflow-payment-verification-design.md)

## Global Constraints

- No test framework in this project — verification is `npx tsc --noEmit` + `npm run lint` (both must stay clean) + real runtime checks (curl, browser, admin panel). Do not add Jest/Vitest/etc.
- Never hardcode a secret — every token/key goes through an env var, added to both `.env` (local) and, at deploy time, the VPS's `.env` **and** `docker-compose.yml`'s `scalwise-app.environment` (the compose file does not pass through `.env` automatically).
- The repo (`github.com/Aditya-051028/Scalwise-Website`) is public — the AI Cashflow PDF must never be committed or placed under `public/`.
- Standalone Node scripts that call Payload's `getPayload()` hang silently (no error, exits 0). Never verify a Payload-touching code path with a bare `node`/`tsx` script — always go through the running `next dev` server (curl or browser). Pure-logic modules with no Payload import (e.g. the token utility) are safe to verify with a standalone `tsx` scratch script.
- Restart `next dev` after editing `payload.config.ts` or any `src/collections/*.ts` file — Payload's Postgres adapter auto-pushes schema changes in development, but only picks up config/collection changes on a fresh boot.
- Follow existing patterns exactly: new collections mirror `src/collections/Leads.ts`; new emails mirror `src/lib/email.ts` + `src/emails/LeadConfirmation.tsx`; new API routes mirror `src/app/api/contact/route.ts` (Local API + `overrideAccess: true`, fire-and-forget email via `.catch(...)`, never awaited — safe here because this is one long-running Docker container, not serverless).

---

### Task 1: Signed download token utility

**Files:**
- Create: `src/lib/download-token.ts`
- Modify: `.env:3` (add `DOWNLOAD_TOKEN_SECRET` after `PAYLOAD_SECRET`)
- Modify: `.env.example` (add `DOWNLOAD_TOKEN_SECRET=replace-with-a-long-random-string` after `PAYLOAD_SECRET`)

**Interfaces:**
- Produces: `signDownloadToken(orderId: string, expiresAt?: number): string` and `verifyDownloadToken(token: string): { orderId: string } | null`, both used by Task 5 (webhook), Task 6 (download route), and Task 7 (success page).

- [ ] **Step 1: Generate a local secret**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

- [ ] **Step 2: Add the secret to local env files**

In `.env`, add a new line right after the `PAYLOAD_SECRET=...` line:

```
DOWNLOAD_TOKEN_SECRET=<paste the generated value>
```

In `.env.example`, add a new line right after the `PAYLOAD_SECRET=...` line:

```
DOWNLOAD_TOKEN_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 3: Write the token utility**

Create `src/lib/download-token.ts`:

```ts
import { createHmac, timingSafeEqual } from "crypto";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) throw new Error("DOWNLOAD_TOKEN_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function signDownloadToken(
  orderId: string,
  expiresAt: number = Date.now() + TWO_YEARS_MS,
): string {
  const payload = JSON.stringify({ orderId, exp: expiresAt });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyDownloadToken(token: string): { orderId: string } | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  let parsed: { orderId?: unknown; exp?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed.orderId !== "string" || typeof parsed.exp !== "number") return null;
  if (Date.now() > parsed.exp) return null;

  return { orderId: parsed.orderId };
}
```

- [ ] **Step 4: Verify with a scratch script**

Create `/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/verify-token.mts`:

```ts
import { signDownloadToken, verifyDownloadToken } from "/Users/aditya0510/Desktop/Scalwise Website NEW/src/lib/download-token";

const token = signDownloadToken("42");
const result = verifyDownloadToken(token);
console.log("valid token ->", result); // expect { orderId: "42" }

const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
console.log("tampered ->", verifyDownloadToken(tampered)); // expect null

const expired = signDownloadToken("42", Date.now() - 1000);
console.log("expired ->", verifyDownloadToken(expired)); // expect null

console.log("garbage ->", verifyDownloadToken("not-a-token")); // expect null
```

Run (this module only touches `crypto`, no Payload import — safe to run standalone per the Global Constraints):

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && DOWNLOAD_TOKEN_SECRET=test-secret npx tsx /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/verify-token.mts
```

Expected output: `valid token -> { orderId: '42' }`, then three `null` lines. Delete the scratch file once confirmed.

- [ ] **Step 5: Typecheck and commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
git add src/lib/download-token.ts .env.example
git commit -m "Add signed download token utility for AI Cashflow delivery"
```

(`.env` is gitignored and never committed.)

---

### Task 2: `Orders` collection

**Files:**
- Create: `src/collections/Orders.ts`
- Modify: `payload.config.ts:16` (import, right after the existing `Products` import), `payload.config.ts:37` (register in `collections` array, right after `Products`)

**Interfaces:**
- Consumes: `isLoggedIn` from `src/collections/access.ts:3`.
- Produces: Payload collection slug `"orders"` with fields `razorpayPaymentId` (unique text), `razorpayPaymentLinkId` (text), `product` (relationship → `products`, required), `amount` (number), `currency` (text), `buyerEmail` (email), `buyerContact` (text), `rawPayload` (json), plus Payload's automatic `id: number` and timestamps. Consumed by Task 5 (webhook creates rows) and Task 7 (success page reads rows).

- [ ] **Step 1: Create the collection file**

Create `src/collections/Orders.ts`:

```ts
import type { CollectionConfig } from "payload";
import { isLoggedIn } from "./access";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "razorpayPaymentId",
    defaultColumns: ["razorpayPaymentId", "product", "buyerEmail", "amount", "createdAt"],
  },
  access: {
    // Created only by the Razorpay webhook route via the Local API with
    // overrideAccess: true — nothing public writes to this collection directly.
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "razorpayPaymentId", type: "text", required: true, unique: true },
    { name: "razorpayPaymentLinkId", type: "text" },
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "amount", type: "number" },
    { name: "currency", type: "text" },
    { name: "buyerEmail", type: "email" },
    { name: "buyerContact", type: "text" },
    { name: "rawPayload", type: "json" },
  ],
  timestamps: true,
};
```

- [ ] **Step 2: Register the collection**

In `payload.config.ts`, add the import after the existing `Products` import (line 16):

```ts
import { Products } from "./src/collections/Products";
import { Orders } from "./src/collections/Orders";
```

Add `Orders` to the `collections` array (after `Products`):

```ts
  collections: [
    Users,
    Media,
    Leads,
    Services,
    Pricing,
    Testimonials,
    CaseStudies,
    Products,
    Orders,
    BlogPosts,
    FAQs,
  ],
```

- [ ] **Step 3: Regenerate types (works standalone per Global Constraints)**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npm run generate:types
```

Confirm `src/payload-types.ts` now contains `export interface Order { id: number; razorpayPaymentId: string; ... }`.

- [ ] **Step 4: Generate the migration**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && CI=true npx payload migrate:create add_orders_collection
```

- [ ] **Step 5: Restart dev server and verify in the admin panel**

Restart `next dev` (picks up the new `payload.config.ts`). In a browser, visit `http://localhost:3000/admin/collections/orders` — confirm it loads with an empty list and the columns `razorpayPaymentId / product / buyerEmail / amount / createdAt`.

- [ ] **Step 6: Typecheck, lint, and commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
git add src/collections/Orders.ts payload.config.ts src/payload-types.ts src/migrations
git commit -m "Add Orders collection for AI Cashflow payment records"
```

(Check `git status` first — the migration files land under `src/migrations/`; adjust the `git add` path if `payload migrate:create` places them elsewhere on this machine.)

---

### Task 3: `Products.razorpayPaymentLinkId` field

**Files:**
- Modify: `src/collections/Products.ts` (add field after the existing `checkoutUrl` field)

**Interfaces:**
- Produces: `Products.razorpayPaymentLinkId: string | undefined` (via regenerated `Product` type in `src/payload-types.ts`), consumed by Task 5's webhook to match an incoming payment to a product.

- [ ] **Step 1: Add the field**

In `src/collections/Products.ts`, add this field immediately after the `checkoutUrl` field block and before `deliveryUrl`:

```ts
    {
      name: "razorpayPaymentLinkId",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Razorpay's internal Payment Link ID (format plink_...), NOT the public rzp.io URL. Find it in the Razorpay dashboard's Payment Link details, or from the first real webhook payload. Required for the payment-verification webhook to attribute a sale to this product.",
      },
    },
```

- [ ] **Step 2: Regenerate types**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npm run generate:types
```

Confirm `src/payload-types.ts`'s `Product` interface now includes `razorpayPaymentLinkId?: string | null;`.

- [ ] **Step 3: Generate the migration**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && CI=true npx payload migrate:create add_products_razorpay_payment_link_id
```

- [ ] **Step 4: Restart dev server and verify in the admin panel**

Restart `next dev`. Visit `http://localhost:3000/admin/collections/products`, open the AI Cashflow product, confirm the new "Razorpay Payment Link ID" field appears in the sidebar under Checkout URL.

- [ ] **Step 5: Typecheck, lint, and commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
git add src/collections/Products.ts src/payload-types.ts src/migrations
git commit -m "Add razorpayPaymentLinkId field to Products for webhook attribution"
```

---

### Task 4: Purchase confirmation email + private PDF storage

**Files:**
- Create: `src/emails/PurchaseConfirmation.tsx`
- Modify: `src/lib/email.ts` (add `sendPurchaseConfirmation`)
- Modify: `.gitignore` (add `/private/` near the existing `/media/` entry at line 45)
- Create (binary, not committed): `private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf`

**Interfaces:**
- Consumes: `Order` type from `src/payload-types.ts` (Task 2), `FROM_ADDRESS` and `getResendClient()` pattern already in `src/lib/email.ts`.
- Produces: `sendPurchaseConfirmation(order: Order, token: string): Promise<void>`, consumed by Task 5's webhook.

- [ ] **Step 1: Ignore the private PDF directory**

In `.gitignore`, add a new line near the existing `/media/` entry (line 45):

```
/private/
```

- [ ] **Step 2: Place the PDF**

```bash
mkdir -p "/Users/aditya0510/Desktop/Scalwise Website NEW/private/ai-cashflow"
cp "/Users/aditya0510/Desktop/AI Cashflow - Expanded Edition.pdf" "/Users/aditya0510/Desktop/Scalwise Website NEW/private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf"
```

- [ ] **Step 3: Write the email template**

Create `src/emails/PurchaseConfirmation.tsx`, matching the structure of `src/emails/LeadConfirmation.tsx`:

```tsx
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
```

- [ ] **Step 4: Add the send function**

In `src/lib/email.ts`, add these imports at the top (after the existing `AdminAlert` import):

```ts
import { readFileSync } from "fs";
import path from "path";
import { PurchaseConfirmation } from "@/emails/PurchaseConfirmation";
import type { Order } from "@/payload-types";
```

Add this constant near `FROM_ADDRESS`:

```ts
const AI_CASHFLOW_PDF_PATH = path.join(
  process.cwd(),
  "private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf",
);
const SITE_URL = "https://scalwise.online";
```

Add this function at the end of the file:

```ts
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
```

- [ ] **Step 5: Verify the PDF path and the no-op guard independently**

Create a scratch script at `/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/verify-pdf.mts`:

```ts
import { readFileSync } from "fs";
import path from "path";

const pdfPath = path.join(
  "/Users/aditya0510/Desktop/Scalwise Website NEW",
  "private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf",
);
const buf = readFileSync(pdfPath);
console.log("PDF size bytes:", buf.length); // expect ~279741, definitely > 100000
```

Run: `npx tsx /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/verify-pdf.mts` (pure `fs`, no Payload — safe standalone). Confirm the size is sane, then delete the scratch script.

This module is not otherwise independently testable standalone because `sendPurchaseConfirmation` imports `@/payload-types` and is exercised for real in Task 5's webhook test — this step only confirms the file placement is correct ahead of that.

- [ ] **Step 6: Typecheck, lint, and commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
git status
git add src/emails/PurchaseConfirmation.tsx src/lib/email.ts .gitignore
git commit -m "Add purchase confirmation email with PDF attachment"
```

Confirm via `git status` that `private/` does not appear as trackable (it should be fully ignored) before committing.

---

### Task 5: Razorpay webhook endpoint

**Files:**
- Create: `src/app/api/webhooks/razorpay/route.ts`
- Modify: `.env` (add `RAZORPAY_WEBHOOK_SECRET`), `.env.example` (add same, placeholder value)

**Interfaces:**
- Consumes: `getPayloadClient()` (`src/lib/payload.ts:4`), `signDownloadToken` (Task 1), `sendPurchaseConfirmation` (Task 4), `Order` type (Task 2), Products' `razorpayPaymentLinkId` (Task 3).
- Produces: `POST /api/webhooks/razorpay`, consumed by the Razorpay dashboard webhook config (production deployment step, not part of this task).

- [ ] **Step 1: Add the webhook secret to local env**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env` (after `DOWNLOAD_TOKEN_SECRET`):

```
RAZORPAY_WEBHOOK_SECRET=<paste the generated value>
```

Add to `.env.example` (after `DOWNLOAD_TOKEN_SECRET`):

```
RAZORPAY_WEBHOOK_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 2: Write the route**

Create `src/app/api/webhooks/razorpay/route.ts`:

```ts
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
```

- [ ] **Step 3: Restart dev server**

Restart `next dev` so the new route and env vars are picked up.

- [ ] **Step 4: Verify signature rejection**

```bash
curl -i -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: wrong" \
  -d '{"event":"payment_link.paid"}'
```

Expected: `HTTP/1.1 400` and `{"error":"Invalid signature"}`.

- [ ] **Step 5: Verify a real webhook creates an Order**

First, set `Products.razorpayPaymentLinkId` on the AI Cashflow product to a test value via `/admin/collections/products` — e.g. `plink_test123` — so the webhook can match it (this also serves as the real production setup step from the spec, done here against local dev data).

Create `/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/webhook-payload.json`:

```json
{
  "event": "payment_link.paid",
  "payload": {
    "payment_link": { "entity": { "id": "plink_test123" } },
    "payment": {
      "entity": {
        "id": "pay_test_001",
        "amount": 34900,
        "currency": "INR",
        "email": "buyer@example.com",
        "contact": "+919999999999"
      }
    }
  }
}
```

Compute the signature and send it (uses the same `RAZORPAY_WEBHOOK_SECRET` value you put in `.env`):

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
SECRET=$(grep RAZORPAY_WEBHOOK_SECRET .env | cut -d= -f2)
SIG=$(node -e "const c=require('crypto');const fs=require('fs');const b=fs.readFileSync('/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/webhook-payload.json');console.log(c.createHmac('sha256',process.env.SECRET).update(b).digest('hex'))")
curl -i -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $SIG" \
  --data-binary @/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/webhook-payload.json
```

Expected: `HTTP/1.1 200` and `{"received":true}`. Check the `next dev` terminal output for `[email] RESEND_API_KEY not set, skipping email send` (confirms the email path was reached and safely no-op'd locally, per Global Constraints — local `.env` has no `RESEND_API_KEY`).

Visit `http://localhost:3000/admin/collections/orders` — confirm one row exists with `razorpayPaymentId: pay_test_001`, `buyerEmail: buyer@example.com`, `amount: 34900`. Note this row's `id` (shown in the row/detail URL) for Task 7's test.

- [ ] **Step 6: Verify idempotency**

Re-run the exact same `curl` command from Step 5. Expected: still `HTTP/1.1 200`, but refresh `/admin/collections/orders` and confirm there is still exactly **one** row (not two).

- [ ] **Step 7: Clean up and typecheck**

```bash
rm /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/webhook-payload.json
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
```

- [ ] **Step 8: Commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
git add src/app/api/webhooks/razorpay/route.ts .env.example
git commit -m "Add Razorpay webhook for AI Cashflow order verification"
```

---

### Task 6: Download route

**Files:**
- Create: `src/app/api/download/ai-cashflow/route.ts`

**Interfaces:**
- Consumes: `verifyDownloadToken` (Task 1), the private PDF path (Task 4).
- Produces: `GET /api/download/ai-cashflow?token=...`, consumed by Task 7's success page `DownloadButton`.

- [ ] **Step 1: Write the route**

Create `src/app/api/download/ai-cashflow/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { verifyDownloadToken } from "@/lib/download-token";

export const dynamic = "force-dynamic";

const AI_CASHFLOW_PDF_PATH = path.join(
  process.cwd(),
  "private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf",
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const verified = verifyDownloadToken(token);

  if (!verified) {
    return NextResponse.redirect(
      new URL("/products/ai-cashflow?downloadExpired=true", request.url),
    );
  }

  if (!existsSync(AI_CASHFLOW_PDF_PATH)) {
    console.error("[api/download/ai-cashflow] PDF missing on disk:", AI_CASHFLOW_PDF_PATH);
    return NextResponse.json({ error: "File temporarily unavailable" }, { status: 500 });
  }

  const stat = statSync(AI_CASHFLOW_PDF_PATH);
  const webStream = Readable.toWeb(
    createReadStream(AI_CASHFLOW_PDF_PATH),
  ) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AI-Cashflow.pdf"',
      "Content-Length": String(stat.size),
    },
  });
}
```

- [ ] **Step 2: Restart dev server**

Restart `next dev`.

- [ ] **Step 3: Verify invalid token redirects**

```bash
curl -i "http://localhost:3000/api/download/ai-cashflow?token=garbage"
```

Expected: `HTTP/1.1 307` (Next's default redirect status) with `location: /products/ai-cashflow?downloadExpired=true`.

- [ ] **Step 4: Verify valid token streams the real file**

Create `/private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/mint-token.mts`:

```ts
import { signDownloadToken } from "/Users/aditya0510/Desktop/Scalwise Website NEW/src/lib/download-token";
console.log(signDownloadToken("999"));
```

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
TOKEN=$(DOWNLOAD_TOKEN_SECRET=$(grep DOWNLOAD_TOKEN_SECRET .env | cut -d= -f2) npx tsx /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/mint-token.mts)
curl -sD - -o /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/downloaded.pdf "http://localhost:3000/api/download/ai-cashflow?token=$TOKEN" | grep -i "content-type\|content-length\|HTTP"
ls -la /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/downloaded.pdf
```

Expected: `HTTP/1.1 200`, `content-type: application/pdf`, and the downloaded file's size matches `private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf`'s size exactly.

- [ ] **Step 5: Clean up and typecheck**

```bash
rm /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/mint-token.mts /private/tmp/claude-501/-Users-aditya0510-Desktop-Scalwise-Website-NEW/602534ae-0278-4821-a3d2-c73fb67d4972/scratchpad/downloaded.pdf
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
git add src/app/api/download/ai-cashflow/route.ts
git commit -m "Add signed-token download route for AI Cashflow PDF"
```

---

### Task 7: Rewrite the success/delivery page

**Files:**
- Modify: `src/app/(site)/products/ai-cashflow/success/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `verifyDownloadToken` (Task 1), `Orders` collection (Task 2), existing `DownloadButton` (`src/components/sections/ai-cashflow/DownloadButton.tsx` — unchanged, already accepts a `deliveryUrl` prop).
- Produces: the buyer-facing delivery page at `/products/ai-cashflow/success?token=...`, the terminal destination of the whole flow — nothing downstream consumes this.

- [ ] **Step 1: Replace the file**

Replace the full contents of `src/app/(site)/products/ai-cashflow/success/page.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { getPayloadClient } from "@/lib/payload";
import { verifyDownloadToken } from "@/lib/download-token";
import { THANK_YOU } from "@/lib/content/ai-cashflow";
import { DownloadButton } from "@/components/sections/ai-cashflow/DownloadButton";
import { PageViewTracker } from "@/components/sections/ai-cashflow/PageViewTracker";
import type { Order } from "@/payload-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "AI Cashflow order confirmation and download.",
  robots: { index: false, follow: false },
};

type SearchParams = { token?: string };

function NotConfirmed() {
  return (
    <>
      <KineticGrid className="z-0" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-xl text-center">
            <GlassPanel className="p-8 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-wide text-lavender">
                Order status
              </p>
              <h1 className="mt-3 font-display text-2xl font-bold text-paper">
                We couldn&rsquo;t confirm an order here.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-lavender">
                If you just completed a purchase, check your email for confirmation and your
                download link. If something went wrong or you got here by mistake, get in touch
                and we&rsquo;ll sort it out directly — no need to repurchase.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button href="/products/ai-cashflow" variant="secondary">
                  Back to AI Cashflow
                </Button>
                <Button href="/#contact" variant="primary">
                  Contact Us
                </Button>
              </div>
            </GlassPanel>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default async function AiCashflowSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const verifiedToken = params.token ? verifyDownloadToken(params.token) : null;

  if (!verifiedToken) {
    return <NotConfirmed />;
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: { id: { equals: Number(verifiedToken.orderId) } },
    limit: 1,
  });
  const order = docs[0] as Order | undefined;

  if (!order) {
    return <NotConfirmed />;
  }

  return (
    <>
      <KineticGrid className="z-0" />
      <PageViewTracker event="purchase_success" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-xl">
            <GlassPanel className="p-8 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-wide text-neon">
                Payment successful
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-paper">
                {THANK_YOU.headline}
              </h1>
              <p className="mt-1 font-display text-lg font-bold text-paper">
                {THANK_YOU.subheadline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-lavender">{THANK_YOU.body}</p>

              <ol className="mt-8 space-y-4">
                {THANK_YOU.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="stat-mono shrink-0 text-sm text-neon">
                      Step {i + 1}
                    </span>
                    <span className="text-sm text-paper">{step.title}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-line pt-6">
                <p className="font-mono text-[10px] uppercase tracking-wide text-lavender/70">
                  AI Cashflow — 83-Page Expanded Edition
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-lavender">
                  <li>✓ Full ebook</li>
                  <li>✓ 30-Day AI Cashflow Challenge</li>
                  <li>✓ 100-Prompt Pack</li>
                  <li>✓ AI Cashflow Operating System</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <DownloadButton deliveryUrl={`/api/download/ai-cashflow?token=${params.token}`} />
                <Link
                  href="/products/ai-cashflow"
                  className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 font-mono text-[13px] font-medium uppercase tracking-[0.1em] text-paper transition-colors duration-200 ease-premium hover:border-neon hover:text-neon"
                >
                  Open the 30-Day Playbook
                </Link>
              </div>

              <p className="mt-6 font-mono text-[10px] text-lavender/50">
                Order: {order.razorpayPaymentId}
              </p>
            </GlassPanel>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Restart dev server**

Restart `next dev`.

- [ ] **Step 3: Verify the "not confirmed" state**

In the browser, visit `http://localhost:3000/products/ai-cashflow/success` (no token) and `http://localhost:3000/products/ai-cashflow/success?token=garbage`. Both must show "We couldn't confirm an order here."

- [ ] **Step 4: Verify the real delivery page end-to-end**

Using the Order `id` you noted in Task 5 Step 5 (call it `<order-id>`), mint a matching token:

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
node -e "
const { createHmac } = require('crypto');
const secret = require('fs').readFileSync('.env','utf8').match(/DOWNLOAD_TOKEN_SECRET=(.*)/)[1].trim();
const payload = JSON.stringify({ orderId: '<order-id>', exp: Date.now() + 1000*60*60*24*365*2 });
const encoded = Buffer.from(payload).toString('base64url');
const sig = createHmac('sha256', secret).update(encoded).digest('hex');
console.log(encoded + '.' + sig);
"
```

Replace `<order-id>` with the real numeric id first. Visit `http://localhost:3000/products/ai-cashflow/success?token=<the printed token>` in the browser. Confirm:
- The page renders the full "You're In" content (headline, steps, what's included).
- The footer shows `Order: pay_test_001`.
- The Download button's link points to `/api/download/ai-cashflow?token=<the same token>`.
- Clicking Download successfully retrieves the PDF (check via the browser's network tab or `read_network_requests` that the request returns 200 with `content-type: application/pdf`).

- [ ] **Step 5: Full regression pass**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW" && npx tsc --noEmit && npm run lint
```

Both must be clean.

- [ ] **Step 6: Commit**

```bash
cd "/Users/aditya0510/Desktop/Scalwise Website NEW"
git add "src/app/(site)/products/ai-cashflow/success/page.tsx"
git commit -m "Wire success page to real token-verified order delivery"
```

---

## After this plan: production deployment (not part of this plan's tasks)

Per the spec §11, still needed before this is live:
1. `scp` the PDF to the VPS at the same `private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf` path (needs a session SSH key, generated fresh per the project's existing pattern).
2. Add `RAZORPAY_WEBHOOK_SECRET` and `DOWNLOAD_TOKEN_SECRET` to the VPS `.env` **and** `docker-compose.yml`'s `scalwise-app.environment`.
3. Create the webhook in the Razorpay dashboard (`https://scalwise.online/api/webhooks/razorpay`, event `payment_link.paid`), copy its secret into step 2.
4. Set the real `Products.razorpayPaymentLinkId` on the AI Cashflow product via production `/admin` (replacing the local test value).
5. Deploy (`git pull && docker compose up -d --build`) — the Dockerfile's `CMD` already runs `npx payload migrate` automatically before starting, so no separate manual migration step is needed.
6. One real low-value test purchase to confirm the end-to-end path before calling this done.
