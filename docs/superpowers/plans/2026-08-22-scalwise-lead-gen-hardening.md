# Scalwise Media — Lead-Gen Backend Hardening (Sub-project 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add honeypot + timing spam defense, in-memory rate limiting, and Resend-based email notifications (confirmation to the lead, alert to the admin) to the contact and newsletter forms, without changing their existing fields or the core shape of the `Leads` collection.

**Architecture:** A new `/api/contact` route becomes the single entry point both forms POST to (replacing their current direct POST to Payload's auto-generated `/api/leads`). The route runs rate-limit → honeypot/timing → Payload Local API create → best-effort email, in that order. A new `formSource` field on `Leads` lets the route (and the email-scoping logic) tell the two forms apart cleanly.

**Tech Stack:** Next.js 16 App Router route handler, Payload CMS 3's Local API, `resend@6.22.0`, `@react-email/components@1.0.12`, in-memory `Map`-based rate limiting (no Redis — this app runs as a persistent process on a single VPS, not serverless).

## Global Constraints

- Rate limit: 5 requests per IP per rolling hour. IP read from the `X-Forwarded-For` header (Caddy sets this automatically on every proxied request).
- Honeypot field name: `website`. Timing threshold: submissions arriving less than 1.5 seconds (1500ms) after the form mounted are treated as spam.
- Both signals (honeypot filled, OR too-fast timing) produce the same response: HTTP 201 with the same success shape as a real creation, but no `Lead` document is actually written.
- `formSource` field on `Leads`: `select`, options exactly `["Contact Form", "Newsletter Footer"]`, `defaultValue: "Contact Form"`, sidebar position.
- Confirmation and admin-alert emails fire **only** when `formSource === "Contact Form"` — never for newsletter signups.
- `resend` pinned to `6.22.0`, `@react-email/components` pinned to `1.0.12` (both verified during brainstorming to support the installed React 19.2.8) — exact versions, no caret.
- Resend's SDK returns `{ data, error }` rather than throwing on a failed send — check `error` explicitly, don't rely on try/catch alone for the primary failure path.
- New env vars `RESEND_API_KEY` and `ADMIN_ALERT_EMAIL` — never committed, added to `.env.example` as placeholders and to `docker-compose.yml` with the same `:?required`-style guard pattern already used for the other required variables there.
- No CAPTCHA, no email delivery tracking/webhooks, no `SiteSettings.contactEmail` work — all explicitly out of scope for this plan.
- TypeScript strict mode; `npx tsc --noEmit` and `npm run lint` must stay clean after every task.
- This project has no automated test framework — verification is via typecheck/lint plus concrete runtime checks (a throwaway script run with `node --env-file=.env --import tsx`, or a real HTTP request), matching the project's established convention. Delete throwaway verification scripts before committing each task.

---

### Task 1: Add `formSource` field to the Leads collection

**Files:**
- Modify: `src/collections/Leads.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks — this is the first task.
- Produces: a `formSource` field (values `"Contact Form"` | `"Newsletter Footer"`, default `"Contact Form"`) on every `Lead` document. Task 4 (the route) sets this explicitly on every create; Task 5 (the forms) sends it in their request bodies.

- [ ] **Step 1: Add the field**

In `src/collections/Leads.ts`, add this field to the `fields` array — place it in the `source` sidebar group's vicinity (right after the `status` field is a natural spot, before the `source` UTM group):

```ts
{
  name: "formSource",
  type: "select",
  options: ["Contact Form", "Newsletter Footer"],
  defaultValue: "Contact Form",
  admin: { position: "sidebar" },
},
```

- [ ] **Step 2: Verify the field is live**

Run `npm run dev`, load `http://localhost:3000/admin`, log in, open **Leads → Create New**. Confirm a "Form Source" select field appears in the sidebar with exactly the two options and defaults to "Contact Form". Stop the dev server afterward.

- [ ] **Step 3: Typecheck and lint stay clean**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Leads.ts
git commit -m "Add formSource field to Leads collection"
```

---

### Task 2: Rate limiting and spam-check utilities

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/spam-check.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `isRateLimited(ip: string): boolean` from `src/lib/rate-limit.ts`, and `isSpamSubmission(input: { website: string; formRenderedAt: number }): boolean` from `src/lib/spam-check.ts`. Task 4 (the route) calls both.

- [ ] **Step 1: Write the rate limiter**

Create `src/lib/rate-limit.ts`:

```ts
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

type Entry = { count: number; resetAt: number };

const requests = new Map<string, Entry>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}
```

- [ ] **Step 2: Write the spam checker**

Create `src/lib/spam-check.ts`:

```ts
const MIN_SUBMIT_MS = 1500;

type SpamCheckInput = {
  website: string;
  formRenderedAt: number;
};

export function isSpamSubmission({ website, formRenderedAt }: SpamCheckInput): boolean {
  if (website.trim().length > 0) return true;
  if (Date.now() - formRenderedAt < MIN_SUBMIT_MS) return true;
  return false;
}
```

- [ ] **Step 3: Verify both with a throwaway script**

Create `verify-spam-utils.ts` at the repo root:

```ts
import { isRateLimited } from "./src/lib/rate-limit";
import { isSpamSubmission } from "./src/lib/spam-check";

// Rate limiter: first 5 calls for a fresh IP must pass, the 6th must be limited.
const ip = "203.0.113.1";
const results: boolean[] = [];
for (let i = 0; i < 6; i++) {
  results.push(isRateLimited(ip));
}
console.log("[verify] rate-limit results (expect [F,F,F,F,F,T]):", results);
if (JSON.stringify(results) !== JSON.stringify([false, false, false, false, false, true])) {
  throw new Error("rate limiter did not behave as expected");
}

// A different IP must not be affected by the first IP's usage.
const otherIpLimited = isRateLimited("203.0.113.2");
console.log("[verify] different IP limited (expect false):", otherIpLimited);
if (otherIpLimited !== false) throw new Error("rate limiter leaked across IPs");

// Spam check: honeypot filled -> spam, regardless of timing.
const honeypotCaught = isSpamSubmission({ website: "http://spam.example", formRenderedAt: Date.now() - 10000 });
console.log("[verify] honeypot filled caught (expect true):", honeypotCaught);
if (honeypotCaught !== true) throw new Error("honeypot check failed");

// Spam check: too fast, honeypot empty -> spam.
const tooFastCaught = isSpamSubmission({ website: "", formRenderedAt: Date.now() });
console.log("[verify] too-fast submission caught (expect true):", tooFastCaught);
if (tooFastCaught !== true) throw new Error("timing check failed");

// Spam check: honeypot empty, plausible human timing -> not spam.
const legitPassed = isSpamSubmission({ website: "", formRenderedAt: Date.now() - 5000 });
console.log("[verify] legitimate submission passes (expect false):", legitPassed);
if (legitPassed !== false) throw new Error("legitimate submission was wrongly flagged");

console.log("[verify] ALL CHECKS PASSED");
```

Run: `npx tsx verify-spam-utils.ts`
Expected: all five `console.log` lines print the expected values, ending with `[verify] ALL CHECKS PASSED`, no thrown error.

Delete `verify-spam-utils.ts` afterward — it's a throwaway check, not part of the codebase.

- [ ] **Step 4: Typecheck and lint stay clean**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit with no errors. Confirm `git status` shows no leftover `verify-spam-utils.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/spam-check.ts
git commit -m "Add in-memory rate limiter and honeypot/timing spam check"
```

---

### Task 3: Email templates and Resend integration

**Files:**
- Create: `src/emails/LeadConfirmation.tsx`
- Create: `src/emails/AdminAlert.tsx`
- Create: `src/lib/email.ts`
- Modify: `package.json` (two new dependencies)
- Modify: `.env.example` (two new placeholders)
- Modify: `docker-compose.yml` (two new required env vars on `scalwise-app`)

**Interfaces:**
- Consumes: nothing from Tasks 1–2 directly (the `Lead` type it uses comes from `@/payload-types`, already generated).
- Produces: `sendLeadConfirmation(lead: Lead): Promise<void>` and `sendAdminAlert(lead: Lead): Promise<void>`, both exported from `src/lib/email.ts`. Task 4 (the route) calls both.

- [ ] **Step 1: Install the dependencies, pinned**

```bash
npm install resend@6.22.0 @react-email/components@1.0.12
```

Expected: `package.json` gains both under `dependencies`, exact versions (no `^`).

- [ ] **Step 2: Write the lead confirmation email**

Create `src/emails/LeadConfirmation.tsx`:

```tsx
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
```

- [ ] **Step 3: Write the admin alert email**

Create `src/emails/AdminAlert.tsx`:

```tsx
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
```

- [ ] **Step 4: Write the Resend wrapper**

Create `src/lib/email.ts`:

```ts
import { Resend } from "resend";
import { LeadConfirmation } from "@/emails/LeadConfirmation";
import { AdminAlert } from "@/emails/AdminAlert";
import type { Lead } from "@/payload-types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "Scalwise Media <hello@scalwise.online>";

export async function sendLeadConfirmation(lead: Lead): Promise<void> {
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
```

**Important — verified against Resend's own current docs, not assumed:** the `react` field takes the component invoked as a function call (`LeadConfirmation({ name: lead.name })`), not JSX (`<LeadConfirmation name={lead.name} />`). The SDK returns `{ data, error }` rather than throwing on a failed send — the `if (error)` checks above are the primary failure handling, not a try/catch.

- [ ] **Step 5: Add the new env vars to `.env.example` and `docker-compose.yml`**

Append to `.env.example`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_ALERT_EMAIL=you@example.com
```

In `docker-compose.yml`, add both to `scalwise-app`'s `environment` list, matching the existing `:?required` guard style used for `PAYLOAD_SECRET` on the line directly above them:

```yaml
      - RESEND_API_KEY=${RESEND_API_KEY:?RESEND_API_KEY is required}
      - ADMIN_ALERT_EMAIL=${ADMIN_ALERT_EMAIL:?ADMIN_ALERT_EMAIL is required}
```

- [ ] **Step 6: Typecheck and lint stay clean**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit with no errors. (Actually sending a test email requires a real `RESEND_API_KEY`, which doesn't exist yet at this point in the plan — Task 6 covers real send verification once the Resend account exists.)

- [ ] **Step 7: Commit**

```bash
git add src/emails/ src/lib/email.ts package.json package-lock.json .env.example docker-compose.yml
git commit -m "Add email templates and Resend integration for lead notifications"
```

---

### Task 4: The `/api/contact` route

**Files:**
- Create: `src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: `isRateLimited` (Task 2), `isSpamSubmission` (Task 2), `sendLeadConfirmation`/`sendAdminAlert` (Task 3), `getPayloadClient` (existing, `src/lib/payload.ts`), the `formSource` field (Task 1).
- Produces: a `POST /api/contact` endpoint. Task 5 (the forms) POSTs here.

- [ ] **Step 1: Write the route**

Create `src/app/api/contact/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { isRateLimited } from "@/lib/rate-limit";
import { isSpamSubmission } from "@/lib/spam-check";
import { sendLeadConfirmation, sendAdminAlert } from "@/lib/email";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { website, formRenderedAt, formSource, ...leadData } = body;

  if (isSpamSubmission({ website: website ?? "", formRenderedAt: formRenderedAt ?? 0 })) {
    return NextResponse.json(
      { doc: null, message: "Lead successfully created." },
      { status: 201 },
    );
  }

  let lead;
  try {
    const payload = await getPayloadClient();
    lead = await payload.create({
      collection: "leads",
      data: { ...leadData, formSource },
    });
  } catch (err) {
    console.error("[api/contact] Failed to create lead:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (formSource === "Contact Form") {
    sendLeadConfirmation(lead).catch((err) =>
      console.error("[api/contact] confirmation email failed:", err),
    );
    sendAdminAlert(lead).catch((err) =>
      console.error("[api/contact] admin alert failed:", err),
    );
  }

  return NextResponse.json({ doc: lead, message: "Lead successfully created." }, { status: 201 });
}
```

Note the email sends are deliberately not `await`ed inline with the response — they're fired with `.catch()` handlers and the response returns immediately after the lead is created, so a slow or failing email provider never delays or fails the user-facing response.

- [ ] **Step 2: Verify with a real request against local dev**

Run `npm run dev`. In a separate terminal:

```bash
curl -s -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Route Verification Test","email":"verify@example.com","message":"testing","preferredContactMethod":"Email","formSource":"Contact Form","website":"","formRenderedAt":'$(( $(date +%s%N) / 1000000 - 5000 ))'}' \
  -w "\nHTTP status: %{http_code}\n"
```

Expected: HTTP 201, response body has a real `doc.id`. (Email sending will fail/log an error at this point since `RESEND_API_KEY` isn't set yet — that's expected and doesn't block the lead creation; confirmed by the 201 status and a real `doc.id` in the response.)

Then verify the honeypot path — same request but with `"website":"http://spam.example"`:

Expected: HTTP 201, but `"doc":null` in the response body — confirms no lead was actually created for the honeypot-triggered request. Cross-check by counting `Lead` rows before and after in `/admin` → Leads, or via `psql` if testing against a scratch DB.

Stop the dev server afterward, and delete the test lead created by the first request (`Route Verification Test`) via `/admin` before committing.

- [ ] **Step 3: Typecheck and lint stay clean**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/contact/route.ts
git commit -m "Add /api/contact route: rate limiting, spam check, lead creation, email"
```

---

### Task 5: Wire honeypot/timing into both forms, point them at the new route

**Files:**
- Modify: `src/components/sections/ContactForm.tsx`
- Modify: `src/components/layout/FooterNewsletterForm.tsx`

**Interfaces:**
- Consumes: the `/api/contact` route from Task 4.
- Produces: nothing further downstream — this is the last code task before deployment.

- [ ] **Step 1: Update ContactForm.tsx**

In `src/components/sections/ContactForm.tsx`:

Add `website: string` to the `FormState` type and to `initialState` (empty string). Add a `formRenderedAt` constant right after the existing `useState` declarations:

```ts
const [formRenderedAt] = useState(() => Date.now());
```

In `handleSubmit`, change the fetch URL from `"/api/leads"` to `"/api/contact"`, and add three fields to the JSON body: `website: form.website`, `formRenderedAt`, and `formSource: "Contact Form"`.

Add the honeypot field inside the `<form>`, anywhere before the closing tag (e.g., right after the opening `<form onSubmit={handleSubmit} className="space-y-6">` line):

```tsx
<input
  type="text"
  name="website"
  value={form.website}
  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
/>
```

- [ ] **Step 2: Update FooterNewsletterForm.tsx**

In `src/components/layout/FooterNewsletterForm.tsx`:

Add the same `formRenderedAt` state declaration. Change the fetch URL from `"/api/leads"` to `"/api/contact"`, and add `website`, `formRenderedAt`, and `formSource: "Newsletter Footer"` to the JSON body (the `website` value needs its own piece of state here too, since this form uses `FormData` rather than controlled inputs for its one visible field — add a `const [website, setWebsite] = useState("")` alongside `formRenderedAt`).

Add the same honeypot `<input>` (adjusted to use `website`/`setWebsite` directly) inside the `<form>`.

- [ ] **Step 3: Verify both forms end-to-end against local dev**

Run `npm run dev`, load `http://localhost:3000`. Submit the real Contact form (scroll to it) with realistic data. Expected: the form shows its "Got it." success state; a new `Lead` appears in `/admin` → Leads with `formSource: "Contact Form"`.

Submit the footer newsletter form with a test email. Expected: shows "You're on the list."; a new `Lead` appears with `formSource: "Newsletter Footer"`.

Confirm via browser dev tools (Network tab) that both requests go to `/api/contact`, not `/api/leads`.

Delete both test leads via `/admin` afterward. Stop the dev server.

- [ ] **Step 4: Typecheck and lint stay clean**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ContactForm.tsx src/components/layout/FooterNewsletterForm.tsx
git commit -m "Wire honeypot/timing spam defense into both forms, post to /api/contact"
```

---

### Task 6: Resend account setup and production deployment

This task is account/dashboard work — creating the Resend account and verifying DNS — performed by the account owner directly, the same pattern used for the VPS/domain setup in sub-project 6a. Not dispatched to an implementer subagent for that reason; the controller walks through it directly with the user, then handles the deploy itself via SSH.

**Files:** none — no code changes in this task.

**Interfaces:**
- Consumes: the `RESEND_API_KEY`/`ADMIN_ALERT_EMAIL`-guarded `docker-compose.yml` from Task 3, and every prior task's code, already merged.
- Produces: a live deployment with working email notifications. Final task — nothing depends on it.

- [ ] **Step 1: Create the Resend account and verify the sending domain**

Sign up at Resend (free tier). Add `scalwise.online` as a sending domain and add the DNS records Resend provides (TXT/CNAME, same mechanism used for the VPS's own DNS in sub-project 6a — via Hostinger's DNS Zone Editor). Wait for verification to complete (usually fast given the low TTL already in use on this domain).

- [ ] **Step 2: Generate the API key**

In the Resend dashboard, create an API key scoped to sending. Copy it.

- [ ] **Step 3: Set the new env vars on the VPS**

SSH into the VPS, append to `/opt/scalwise/.env`:

```
RESEND_API_KEY=<the key from Step 2>
ADMIN_ALERT_EMAIL=thakursahab2828@gmail.com
```

- [ ] **Step 4: Redeploy**

On the VPS: `cd /opt/scalwise && git pull && docker compose up -d --build`. Watch the build logs for success, then confirm both containers are running and healthy (`docker ps`).

- [ ] **Step 5: Verify against the live site**

Submit the real contact form on `https://scalwise.online`. Confirm: the lead appears in `/admin` with `formSource: "Contact Form"`, the confirmation email arrives at the address used in the test, and the admin alert arrives at `ADMIN_ALERT_EMAIL`.

Submit the footer newsletter form. Confirm: the lead appears with `formSource: "Newsletter Footer"`, and **no** emails arrive for it.

Attempt a honeypot-triggered submission via `curl` against the live domain (same technique as Task 4 Step 2, pointed at `https://scalwise.online/api/contact`). Confirm HTTP 201 with `doc: null`, no lead created.

Submit the real contact form 6 times in quick succession (or via a short curl loop). Confirm the 6th returns HTTP 429.

Delete any test leads created during this verification via `/admin`.

- [ ] **Step 6: Update PROJECT_CONTEXT.md**

Mark sub-project 3 as done in the roadmap (§13), matching the style already used for sub-project 6a. Note the new `formSource` field in the `Leads` collection's field list (§7), and add `RESEND_API_KEY`/`ADMIN_ALERT_EMAIL` to the production deployment section's secrets list (§11).

- [ ] **Step 7: Commit and push**

```bash
git add PROJECT_CONTEXT.md
git commit -m "Update PROJECT_CONTEXT.md: sub-project 3 (lead-gen hardening) is live"
git push origin main
```
