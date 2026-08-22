# Scalwise Media — Lead-Gen Backend Hardening (Sub-project 3)

Basic spam defense, rate limiting, and email notifications for the contact/newsletter forms. Currently leads only get written to Postgres silently — no spam defense, no notification to anyone when a real inquiry comes in.

Related: [`PROJECT_CONTEXT.md`](../../../PROJECT_CONTEXT.md) is the living reference for the whole codebase.

---

## 1. Goal

Close the biggest live gap in the lead-gen pipeline: right now a real business inquiry produces zero signal unless someone manually checks `/admin`, and there's no defense against automated spam submissions. This pass adds a honeypot + timing check, in-memory rate limiting, and email notifications (confirmation to the lead, alert to the admin) — without changing the actual form fields or the `Leads` collection's core shape.

## 2. Current state

- `ContactForm.tsx` and `FooterNewsletterForm.tsx` (`src/components/sections/ContactForm.tsx`, `src/components/layout/FooterNewsletterForm.tsx`) both POST directly to Payload's auto-generated REST endpoint at `/api/leads` — there is no custom API route in `src/app/api/` today; `src/app/` only contains the `(payload)` and `(site)` route groups.
- The newsletter form distinguishes itself from a real inquiry only by hardcoding `name: "Newsletter subscriber"` and `message: "Newsletter signup from footer"` in its payload — a fragile signal to build notification logic on.
- No rate limiting, no spam defense, no outbound email exists anywhere in the codebase. `package.json` has no `resend`, `react-email`, or rate-limiting package installed.
- `SiteSettings.contactEmail` is empty (real business contact info is sub-project 4's job, not this one) — the admin alert's recipient is supplied directly here instead, since it doesn't depend on that.
- Verified compatible with the installed stack: `resend@6.22.0` and `@react-email/components@1.0.12` (peer dependency `react: ^18.0 || ^19.0`) both support the installed React 19.2.8.

## 3. Request pipeline

New route: `src/app/api/contact/route.ts`. Both forms are updated to POST here instead of `/api/leads` directly.

```
POST /api/contact
  1. Rate-limit check (§4) — reject with 429 if exceeded
  2. Honeypot + timing check (§5) — if triggered, return 200 "success" but do NOT create a Lead
  3. Create the Lead via Payload's Local API (getPayloadClient().create(...))
     — a real failure here (validation, DB) returns an error to the client
  4. Fire confirmation + admin emails (§7), best-effort:
     — failures are logged (console.error) but never fail the response,
       since the Lead is already safely written by this point
```

Payload's own `/api/leads` REST endpoint keeps its existing `create: anyone` access rule untouched — this route is additive, not a replacement for it at the collection level.

## 4. Rate limiting

In-memory, keyed by client IP:

- IP is read from the `X-Forwarded-For` header — Caddy sets this automatically on every request it reverse-proxies (`docker-compose.yml`'s `scalwise-app` is only ever reached through Caddy, never directly).
- A module-level `Map<string, { count: number; resetAt: number }>` in the route file (or a small `src/lib/rate-limit.ts` helper) persists for the lifetime of the running Node process — correct for this single-instance VPS deployment (see `PROJECT_CONTEXT.md` §11 for why: no horizontal scaling, one long-running container, not serverless).
- Limit: **5 requests per IP per rolling hour**. Expired entries are swept lazily on access (checked and deleted when that IP's key is next read), not via a background timer — no need for a cleanup interval at this scale.
- Exceeding the limit returns HTTP 429. The client shows a rate-limit-specific error message rather than the generic one.

## 5. Honeypot + timing

Both forms get:

- A hidden field named `website` — a name automated form-fillers commonly target since it's ubiquitous across real forms on the web. Hidden via off-screen CSS positioning (not `display: none` or `type="hidden"`, both of which some bots specifically detect and skip) — `position: absolute; left: -9999px`, plus `tabIndex={-1}`, `autoComplete="off"`, and `aria-hidden="true"` so it's inert for real users and assistive tech.
- A `formRenderedAt` value captured via `useState(() => Date.now())` at mount, sent as part of the submission payload.

Server-side, in the new route: if `website` has any value, OR the submission arrives less than **1.5 seconds** after `formRenderedAt`, the request is treated as spam. Response is a **fake success** (200, same shape as a real success) with no Lead ever written to Postgres — telling a bot it was rejected only teaches it to adapt, so the response is indistinguishable from a real success from the bot's perspective.

Trade-off, stated plainly: the 1.5s timing threshold could theoretically produce a false positive for an unusually fast legitimate submission (aggressive browser autofill plus an immediate click). Given this is "basic spam defense" per the roadmap, not a zero-false-positive system, and 1.5s is already a conservative threshold most real users won't hit, this is accepted as-is rather than engineered around further.

## 6. Leads collection change

One new field on `src/collections/Leads.ts`:

```ts
{
  name: "formSource",
  type: "select",
  options: ["Contact Form", "Newsletter Footer"],
  defaultValue: "Contact Form",
  admin: { position: "sidebar" },
}
```

Both forms set this explicitly on submission. Replaces guessing the origin from the newsletter form's hardcoded `message` text — used by the route to decide which emails to send (§7) and gives the admin a clean, filterable signal in `/admin` going forward.

## 7. Email

**Provider:** Resend (verified above as the current best free-tier option — 3,000 emails/month, and what the project's own original roadmap already anticipated). Requires a free Resend account and DNS verification of `scalwise.online` as a sending domain (a few TXT/CNAME records, added the same way the VPS's own DNS was set up in sub-project 6a) — both are manual steps the user does directly, walked through during implementation.

**New files:**
- `src/emails/LeadConfirmation.tsx` — React Email component. Short, on-brand acknowledgment: "Got your message, we'll be in touch shortly."
- `src/emails/AdminAlert.tsx` — React Email component. Full submission details (name, email, phone, company, business type, interested services, budget, message, preferred contact method) plus a direct link into `/admin` to view/act on it.
- `src/lib/email.ts` — thin wrapper around the Resend client, exporting `sendLeadConfirmation(lead)` and `sendAdminAlert(lead)`.

**Sending address:** `Scalwise Media <hello@scalwise.online>` (only valid once the domain is verified in Resend — adjustable if a different local-part is preferred).

**Scoping (per the earlier decision):** both emails fire **only** when `formSource === "Contact Form"`. A newsletter signup already gets its own inline "You're on the list" confirmation in the UI; sending it a second, business-inquiry-toned "we got your message" email would be the wrong signal, and alerting the admin on every newsletter signup would bury the leads that actually need a fast response.

**Admin recipient:** read from a new `ADMIN_ALERT_EMAIL` environment variable (set to `thakursahab2828@gmail.com`) rather than hardcoded in source — consistent with how every other piece of deployment config works in this project, and changeable without a code deploy. Not read from `SiteSettings.contactEmail`, which is empty and out of scope for this sub-project (sub-project 4). Worth revisiting once that's populated, noted as a follow-up rather than blocking this pass.

## 8. Environment variables

New: `RESEND_API_KEY` (generated in the Resend dashboard) and `ADMIN_ALERT_EMAIL` (`thakursahab2828@gmail.com`). Both set in the VPS's `/opt/scalwise/.env` (never committed, matching every other secret in this deployment) and added to `.env.example` with placeholders, matching the existing convention for that file. Also added to `docker-compose.yml`'s `scalwise-app` environment block with the same `:?required`-style guard pattern already used for the other required variables.

## 9. Explicitly out of scope

- CAPTCHA — honeypot + timing is what "basic spam defense" in the roadmap calls for; a CAPTCHA is a larger, more user-hostile escalation to reach for only if this proves insufficient.
- Email delivery tracking, bounce handling, or Resend webhooks.
- Populating `SiteSettings.contactEmail` or any other sub-project 4 content work.
- Any change to WhatsApp, Calendly, or analytics (sub-project 5).
- Changing the rate-limit or timing thresholds based on real-world tuning — the values above are reasoned defaults, not measured against live traffic (there isn't any yet).

## 10. Verification

This project has no automated test framework (matches the rest of the codebase — see `PROJECT_CONTEXT.md` §10). Verification is direct and concrete:

- Submit the real contact form on the live site with real data → confirm the Lead appears in `/admin` with `formSource: "Contact Form"`, confirm both emails actually arrive.
- Submit the newsletter form → confirm the Lead appears with `formSource: "Newsletter Footer"`, confirm **no** emails are sent.
- Submit with the honeypot field populated (via a raw `fetch` call, since it's invisible in the real UI) → confirm a 200 response but no new Lead row.
- Submit immediately (under 1.5s) after page load via a scripted request → confirm the same silent-discard behavior.
- Submit 6 times in under an hour from the same origin → confirm the 6th returns 429.
- `npx tsc --noEmit` and `npm run lint` stay clean throughout (existing project convention).

## 11. What needs you specifically

- Creating the free Resend account.
- Adding the DNS verification records for `scalwise.online` in Resend (I'll give you the exact records once the account exists).
- Confirming `RESEND_API_KEY` and `ADMIN_ALERT_EMAIL` get added to the VPS's `.env` once the account exists.
