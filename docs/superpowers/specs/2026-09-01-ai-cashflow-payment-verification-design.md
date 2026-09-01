# AI Cashflow — Payment Verification & Delivery

Closes the biggest live gap in the AI Cashflow funnel: the product is live at real money (`/products/ai-cashflow`, Razorpay Payment Link `https://rzp.io/rzp/Qj0wuzB`), but there is no payment verification and no automated delivery. A real buyer today gets nothing automatic — someone has to check the Razorpay dashboard by hand and email the PDF.

Related: [`SCALWISE_HANDOFF.md`](../../../../SCALWISE_HANDOFF.md) (Desktop, §0.1 and §4.1) is where this gap was first documented. `PROJECT_CONTEXT.md` is stale and does not mention AI Cashflow at all yet.

---

## 1. Goal

Automate order verification and delivery for AI Cashflow specifically, using infrastructure that already exists (Resend, Payload, the existing `success` page) rather than replacing the working checkout link. Out of scope: refunds/chargebacks, a generic multi-product delivery system (only AI Cashflow needs this today — the `Products.deliveryUrl` field remains available as a simpler manual escape hatch for any future product that doesn't need this), and Razorpay redirect-based instant confirmation (not configured on the Payment Link today — see §8).

## 2. Current state

- `BuyNowButton` links directly to the static Razorpay Payment Link. No order is created on our side before payment; Razorpay collects the buyer's email as part of its own checkout (confirmed by the user), but no redirect URL is configured, so Razorpay never sends the buyer back to our site after payment.
- `success/page.tsx` (`src/app/(site)/products/ai-cashflow/success/page.tsx`) gates on a bare `?verified=true` query param — explicitly documented in-code as a fakeable placeholder, not real verification.
- `DownloadButton` renders from `product.deliveryUrl`, which is empty today.
- `src/lib/email.ts` + `src/emails/*.tsx` (Resend, React Email) already work in production today (confirmed: contact-form confirmations are delivered live) — this is extended, not introduced.
- No `Orders` collection, no webhook route, no signed-token utility exist yet.
- The actual PDF (`/Users/aditya0510/Desktop/AI Cashflow - Expanded Edition.pdf`, ~273KB) exists only on the user's Desktop — not deployed anywhere.

## 3. Flow

```
Buyer pays via Razorpay Payment Link
  → Razorpay sends `payment_link.paid` webhook to POST /api/webhooks/razorpay
    1. Verify x-razorpay-signature (HMAC-SHA256 of raw body, RAZORPAY_WEBHOOK_SECRET)
    2. Match payment_link.entity.id against Products.razorpayPaymentLinkId
    3. Idempotency: skip if Orders.razorpayPaymentId already exists
    4. Create Orders record (Local API, overrideAccess: true)
    5. Mint a signed token for this order
    6. Send confirmation email (Resend): PDF attached + link to
       /products/ai-cashflow/success?token=...
  → Buyer opens the email, clicks through (or just uses the attachment directly)
    → success page verifies token server-side, renders existing "You're In" content
      with a Download button pointing at /api/download/ai-cashflow?token=...
    → download route re-verifies the same token, streams the PDF from disk
```

Email is the primary delivery channel (attachment — works even if the buyer never clicks anything). The success page + download route are the durable backup / resend surface, reachable from the email link at any time before the token expires.

## 4. Data model

**New collection** `src/collections/Orders.ts`:

```ts
{
  slug: "orders",
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: "razorpayPaymentId", type: "text", required: true, unique: true },
    { name: "razorpayPaymentLinkId", type: "text" },
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "amount", type: "number" },
    { name: "currency", type: "text" },
    { name: "buyerEmail", type: "text" },
    { name: "buyerContact", type: "text" },
    { name: "rawPayload", type: "json" }, // full webhook body, for debugging without Razorpay dashboard access
  ],
}
```

`create` is `isLoggedIn` (not `anyone`) because nothing public ever writes to it directly — only the webhook route does, via the Local API with `overrideAccess: true`, same reasoning already used for `Products`.

**New field on `src/collections/Products.ts`**: `razorpayPaymentLinkId` (text, sidebar) — Razorpay's internal `plink_...` ID for that product's Payment Link (not the public `rzp.io/...` slug). Needed so the webhook can look up which product a payment belongs to. Populated once, manually, after finding the ID in the Razorpay dashboard's Payment Link details (or from the `payment_link.entity.id` in the first real/test webhook payload if the dashboard doesn't surface it directly).

Two migrations: `add_orders_collection`, `add_products_razorpay_payment_link_id`.

## 5. PDF storage

The repo is public on GitHub — the PDF cannot be committed or placed under `public/`. It lives at a new gitignored path, `private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf`, read directly via `fs` in the download route and the webhook's email step (no Payload upload collection involved — avoids depending on exactly how strictly Payload's own static-file serving enforces collection access control).

- Local dev: copied from the user's Desktop into that path as part of implementation.
- Production: not part of the code deploy — the user gets it onto the VPS once, out-of-band (`scp`), into the same gitignored path (persists across `git pull` since it's untracked, same as `.env` already does).

## 6. Webhook endpoint

`POST /api/webhooks/razorpay` (`src/app/api/webhooks/razorpay/route.ts`):

1. `const rawBody = await request.text()` — signature verification needs exact bytes, not re-serialized JSON.
2. Verify `x-razorpay-signature` header: `HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)`. Mismatch → 400, stop.
3. Parse body. If `event !== "payment_link.paid"` → 200, no-op (Razorpay may later be configured to send other event types to the same endpoint).
4. Look up the `Products` record by `razorpayPaymentLinkId` matching `payload.payment_link.entity.id`. Not found → log + 200 (nothing we can attribute this to; avoid a Razorpay retry loop for a config problem that retrying can't fix).
5. Idempotency: `payload.find({ collection: "orders", where: { razorpayPaymentId: { equals: payment.entity.id } } })`. Existing → 200, stop.
6. Create the `Orders` record from `payload.payment.entity`: `id` → `razorpayPaymentId`, `amount` (paise — Razorpay's convention; stored as-is, no conversion) and `currency` → `amount`/`currency`, `email`/`contact` → `buyerEmail`/`buyerContact` (falling back to `payload.payment_link.entity.customer?.email`/`?.contact` if the payment entity's own fields are absent).
7. Mint the download token (§7) and call a new `sendPurchaseConfirmation(order, product)` in `src/lib/email.ts`, following the exact pattern of `sendLeadConfirmation` — PDF read from disk and attached, plus the success-page link.
8. Respond 200 once the Order is written, regardless of email outcome — a Resend failure is logged (`console.error`, same pattern as existing email functions) but must never cause Razorpay to retry a webhook whose order-recording side already succeeded.

New env var: `RAZORPAY_WEBHOOK_SECRET`, generated by Razorpay when the webhook is created in their dashboard (Settings → Webhooks → Add New Webhook, URL `https://scalwise.online/api/webhooks/razorpay`, event `payment_link.paid`).

## 7. Signed token

`src/lib/download-token.ts`, built on Node's built-in `crypto` — no new dependency:

- `sign({ orderId, exp })` → `base64url(JSON.stringify({orderId, exp})) + "." + HMAC-SHA256(that string, DOWNLOAD_TOKEN_SECRET)`
- `verify(token)` → recomputes the HMAC, checks it matches and `exp > Date.now()`, returns `{ orderId }` or `null`.
- `exp` set to **2 years** out at mint time. The token's protection comes from being unguessable and traceable to a specific order (visible in `/admin` → Orders), not from a short time window — a real buyer returning months later should not hit a dead link and file a support request.

New env var: `DOWNLOAD_TOKEN_SECRET` — a fresh random secret, added to `.env` + `docker-compose.yml` (never hardcoded, never committed), same pattern as the project's existing `DEV_SEED_TOKEN` convention.

## 8. Success page & download route

`success/page.tsx` is rewritten to read `?token=` instead of `?verified=true`/`order_id`/`payment_id`:

- Verify the token. Invalid/missing/expired → the existing "We couldn't confirm an order here" state (already built, unchanged).
- Valid → look up the `Order` by `orderId`, render the existing "You're In" content unchanged, with `DownloadButton` now pointed at `/api/download/ai-cashflow?token=<same token>` instead of `product?.deliveryUrl`. The order-reference footer (currently reading raw `order_id`/`payment_id` query params) now reads `order.razorpayPaymentId` from the verified, looked-up record instead of trusting query params directly.

`GET /api/download/ai-cashflow` (`src/app/api/download/ai-cashflow/route.ts`):

- Verify token. Invalid/expired → redirect to `/products/ai-cashflow?downloadExpired=true` (friendly message + existing Contact CTA), never a raw 403/404.
- Valid → stream the private PDF (`fs.createReadStream`) with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="AI-Cashflow.pdf"`.

**Not built now:** Razorpay Payment Link redirect-based instant confirmation. The Payment Link has no redirect URL configured today, so this path is unreachable regardless — adding code for it now would be speculative. If the user later adds a redirect URL in the Razorpay dashboard, extending the success page to also accept and verify `razorpay_payment_id`/`razorpay_signature` redirect params (Razorpay's documented Payment Link redirect-signature formula) is a small, separate follow-up, not part of this change.

## 9. Error handling summary

| Case | Behavior |
|---|---|
| Webhook signature invalid | 400, no processing, logged |
| Unrecognized event type | 200, no-op |
| Payment link ID doesn't match any Product | 200, logged (avoids infinite Razorpay retries on a config issue) |
| Duplicate webhook (same payment ID) | 200, no-op |
| Resend send fails | Order still recorded; logged; webhook still returns 200 |
| Download token invalid/expired | Redirect to product page with a friendly message, never a bare error page |
| PDF missing on disk in production | 500 from the download route, logged — this is a deployment-step failure (§5), not something to silently paper over |

## 10. Testing plan

No test framework in this project (see `PROJECT_CONTEXT.md` conventions) — verification is `tsc --noEmit` + `lint` + real runtime checks:

- Simulate the webhook locally: compute a valid HMAC signature for a sample `payment_link.paid` payload against a local `RAZORPAY_WEBHOOK_SECRET`, `curl` it against `next dev`, confirm an `Orders` record is created and is idempotent on a second identical call.
- Verify token sign/verify round-trip and expiry rejection directly.
- Hit `/api/download/ai-cashflow` with a valid and an invalid token, confirm correct streaming vs. redirect behavior.
- Local `.env` has no `RESEND_API_KEY` today, so local testing of the actual email send will no-op (existing documented behavior in `email.ts`) — order creation, token minting, and the download route are fully verifiable locally regardless; the email step is confirmed once deployed (production `RESEND_API_KEY` already confirmed live).
- In production: one real low-value purchase (or Razorpay's test-mode webhook trigger, if available for Payment Links) to confirm the end-to-end path before considering this done.

## 11. Deployment steps (beyond the code deploy)

1. Get the PDF onto the VPS at `private/ai-cashflow/AI-Cashflow-Expanded-Edition.pdf` (out-of-band, `scp` — needs a session SSH key per the project's existing ephemeral-key pattern).
2. Add `RAZORPAY_WEBHOOK_SECRET` and `DOWNLOAD_TOKEN_SECRET` to the VPS `.env` and to `docker-compose.yml`'s `scalwise-app.environment` (both are silently inert otherwise — bit twice before on this exact class of mistake).
3. Create the webhook in the Razorpay dashboard pointing at `https://scalwise.online/api/webhooks/razorpay`, event `payment_link.paid`; copy the secret it generates into step 2.
4. Set `Products.razorpayPaymentLinkId` on the AI Cashflow product record via `/admin`.
5. Run the new migrations against production.
