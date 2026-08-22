# Scalwise Media — Project Context

Last updated: 2026-08-22. This is a living reference for the codebase — architecture, decisions, what's built, what isn't, and the conventions to follow when adding to it. Update it as the project moves forward; don't let it go stale.

Related: [`docs/superpowers/specs/2026-08-22-scalwise-foundation-design.md`](docs/superpowers/specs/2026-08-22-scalwise-foundation-design.md) is the original foundation spec (brand tokens, architecture rationale, sub-project roadmap). This file supersedes it for anything that's since changed and covers everything built after it.

---

## 1. What this is

A marketing website + lead-gen backend + CMS for **Scalwise Media**, a performance-marketing/local-SEO/content agency (tagline: *"Scale Smarter"*). Single homepage today, built section by section, backed by a real CMS from day one rather than hardcoded content.

Brand source of truth: `Scalwise Brand/Scalwise brand guidelines/` (outside this repo, on the user's Desktop) — palette, type, logo usage, voice.

---

## 2. Tech stack

| Layer | Choice | Version (see `package.json` for exact) |
|---|---|---|
| Framework | Next.js, App Router | 16.3.2 |
| UI | React | 19.2.8 |
| Language | TypeScript | strict |
| Styling | Tailwind CSS | v4, CSS-first config (`@theme inline` in `globals.css`, no `tailwind.config.js`) |
| CMS / Backend | Payload CMS 3, embedded in the Next.js app (not a separate service) | ^3.88 |
| Database | Postgres, via `@payloadcms/db-postgres` | local Homebrew Postgres for dev |
| Animation | Framer Motion (`framer-motion`) | ^13 |
| 3D | React Three Fiber + drei + Three.js | Hero scene only |
| Animated numbers | `@number-flow/react` | Pricing widget |
| Deploy target | Docker Compose on a Hostinger VPS, live at [scalwise.online](https://scalwise.online) | — |

No monorepo. No separate backend service — Payload's Next.js integration runs inside this same app. No shadcn/ui — components live in `src/components/ui/` following the same convention shadcn uses, but hand-built to match the brand system exactly rather than pulled from the CLI.

---

## 3. Architecture decisions (and why)

- **Unified CMS over split Backend/CMS/Admin-Dashboard.** The original brief listed those as three separate things; they're one system wearing three names. Payload gives one auth system, one data model, one admin UI that covers leads, content, and settings. Rejected alternatives: Sanity + a separate custom leads dashboard (two admin surfaces instead of one), and a fully hand-rolled Prisma + bespoke admin UI (reinvents auth/RBAC/uploads/rich-text Payload ships for free).
- **Payload embedded, not standalone.** `payload.config.ts` lives at the repo root; the `(payload)` route group inside `src/app/` hosts the admin UI and its REST API. One deploy target, one repo.
- **Route groups split public vs. admin.** `src/app/(site)/` = the marketing site (has its own root layout with fonts/metadata). `src/app/(payload)/` = Payload's admin + API (has its own root layout, generated/managed by Payload). Next.js supports multiple root layouts this way; there's no `layout.tsx` directly under `src/app/`.
- **Local Postgres for dev, swap for prod.** No managed Postgres account existed when this started, so Postgres was installed locally via Homebrew rather than blocking on account creation. Swapping `DATABASE_URL` in `.env` for Neon/any managed Postgres at deploy time is the only change needed — nothing else in the code assumes local.
- **Content collections are public-read, admin-write; Leads is admin-only at the collection level.** `Leads.access.create` is `isLoggedIn`, closing Payload's auto-generated `/api/leads` REST endpoint to the public. The contact form and footer newsletter still work unauthenticated because `/api/contact` calls the Local API with `overrideAccess: true` — that route is the only public path into `Leads`, and it's the one carrying rate limiting, spam checks, and a field allow-list. `read`/`update`/`delete` stay `isLoggedIn` as before. See `src/collections/access.ts` and `src/app/api/contact/route.ts`.
- **Sample data is flagged, not hidden.** `Testimonials` and `CaseStudies` both have a `sampleData` boolean (default `true`) that drives a visible "SAMPLE" badge in the UI. Nothing on the site claims to be a real client result unless a human has gone into the admin and unchecked that box.
- **No fabricated content, ever.** No invented client names/logos, no fake stats presented as real, no dead links to pages that don't exist, no placeholder social/contact links. Where real data doesn't exist yet (contact email, socials, phone), the UI reads from `SiteSettings` and renders nothing until that data is real — see `ContactSection.tsx`'s conditional email/social block.

---

## 4. Design system

### Brand

- **Name:** Scalwise Media (confirmed over "ScaleWise" — the logo files are the source of truth)
- **Tagline:** "Scale Smarter"
- **Positioning:** turns ad spend and content into predictable growth for local and D2C brands, via performance ads, GBP/local SEO, and content
- **Voice:** direct not salesy, numbers over adjectives, confident not arrogant
- **Market:** assumed India/INR (₹ appears in the brand guidelines' own copy examples) — flag if wrong

### Color tokens (`src/app/globals.css`)

| Token | Hex | Usage |
|---|---|---|
| `--void` | `#12051F` | Dominant background — 60% |
| `--void-2` | `#1B0733` | Gradient stop |
| `--void-3` | `#210A3D` | Elevated surfaces / cards |
| `--purple` | `#5B21B6` | Primary brand color — 30% |
| `--purple-light` | `#9061F9` | Gradients, highlights |
| `--neon` | `#D4FF3D` | **Accent only** — CTAs, stats, hover glow — 10%. Never ambient/background. |
| `--lavender` | `#B7A9D6` | Secondary text, captions |
| `--paper` | `#F7F4FC` | Light surfaces, reversed text |
| `--line` | `rgba(247,244,252,0.10)` | Hairline borders, glass edges |

All exposed as Tailwind utilities via `@theme inline` (e.g. `bg-void-3`, `text-neon`, `border-line`).

### Typography

- **Space Grotesk** (`--font-display`, weights 500/700) — headings
- **Inter** (`--font-body`, weights 400/600) — body text, the default
- **JetBrains Mono** (`--font-mono`, weights 400/500/700) — eyebrows, labels, stats, always uppercase + tracked

All self-hosted via `next/font/google` in `src/app/(site)/layout.tsx`.

### Spacing / shape / motion tokens

- Section rhythm: 96px vertical padding (`py-24`), 48px container gutter — lifted from the brand guidelines deck's own layout
- Radii: 16–20px on cards/panels, full-round on pills/badges
- Elevation: purple-tinted ambient shadows (`shadow-glow-purple`) for lift; neon glow (`shadow-glow-neon`) reserved for hover/interactive states only
- Easing: `--ease-premium: cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) — used everywhere via `EASE_PREMIUM` in `src/components/motion/variants.ts`
- Scroll reveals trigger **once** (no replay scrolling back up) — see `Reveal.tsx`
- `prefers-reduced-motion` is respected globally (CSS media query in `globals.css` collapses all animation/transition durations) *and* per-component for JS-driven effects (R3F scene, KineticGrid) that the CSS rule can't reach

---

## 5. Project structure

```
payload.config.ts              Payload config: collections, globals, Postgres adapter, secret
src/
  app/
    (site)/                    Public marketing site
      layout.tsx                 Root layout for the site: fonts, metadata, <html>/<body>
      page.tsx                   Homepage — assembles every section in order
    (payload)/                 Payload admin UI + REST API (Payload-managed, mostly untouched)
      layout.tsx
      admin/[[...segments]]/      Admin panel catch-all
      api/[...slug]/               REST API catch-all
    globals.css                 Design tokens, base styles, .btn-glow, reduced-motion rules
  collections/                 Payload collection/global configs (see §7)
    access.ts                    Shared isLoggedIn / anyone access-control helpers
  components/
    ui/                         Generic, reusable primitives — not page-specific
      Button.tsx                   primary/secondary variants, primary gets .btn-glow
      GlassPanel.tsx                translucent card surface
      SectionHeading.tsx            eyebrow + title + description, wrapped in Reveal
      Divider.tsx                    diagonal trend-line SVG, echoes the brand deck
      AnimatedLabel.tsx              letter-fly-up floating label primitive
      FloatingLabelInput/Textarea/Select.tsx   form fields built on AnimatedLabel
    sections/                   One file per homepage section (page-specific, fetch their own data)
      Hero, TrustStrip, Services, Industries, Process, Proof, ProofGrid,
      Testimonials, WhyScalwise, PricingSection, PricingInteractive,
      FAQ, FAQAccordion, ContactSection, ContactForm
    layout/                     Header, Footer, FooterNewsletterForm
    three/                      R3F/WebGL-specific: HeroScene, HeroSceneLoader, StaticMark
    effects/                    Canvas/CSS visual effects not tied to one section: KineticGrid, GradientReveal
    motion/                     Reveal.tsx (scroll-reveal wrapper), variants.ts (shared Framer Motion variants + EASE_PREMIUM)
  lib/
    payload.ts                  getPayloadClient() — Local API access for Server Components
    hooks/                      use-media-query, use-in-view, use-scrolled
    content/                    Static (non-CMS) content: industries.ts, process.ts
  seed.ts                      One-off script: populates Services/Pricing/FAQs/sample Testimonials+CaseStudies
public/brand/                  scalwise-icon.svg, scalwise-icon-badge.svg (the bloated lockup SVGs with embedded fonts were deliberately NOT used — wordmark is live text instead)
docs/superpowers/specs/        Point-in-time design specs (brainstorming skill output)
```

**Convention for where a new component goes:** generic + reusable + no data fetching → `ui/`. Tied to one homepage section + may fetch its own Payload data → `sections/`. Persistent chrome around every page → `layout/`. Canvas/WebGL → `three/` or `effects/` depending on whether it's literally Three.js or a 2D-canvas/CSS effect.

---

## 6. Homepage sections (current order, all in `(site)/page.tsx`)

1. **Hero** — headline, subhead, CTAs, trust chips; R3F 3D scene (see §8)
2. **TrustStrip** — compact row of platform names (Meta Ads, Google Ads, GBP, Instagram, Analytics) — not a full section
3. **Services** — 14 real services grouped into 6 categories, fetched from Payload, category cards with tag-pill sub-services
4. **Industries** — 9 target verticals, static content (not CMS-backed — see §7 for why)
5. **Process** — 5 numbered steps (Diagnose → Plan → Launch → Optimize → Scale), static content, genuinely sequential so numbering is justified
6. *Divider* (brand trend-line SVG)
7. **Proof** — case studies from Payload, client-side industry filter, SAMPLE badges, illustrative-range stats (not fabricated precise numbers)
8. **Testimonials** — from Payload, SAMPLE badges, star ratings
9. **WhyScalwise** — the three brand pillars (Performance / Strategy / Execution) verbatim from the brand guidelines
10. **PricingSection** — real 3-tier pricing (Liftoff/Ascent/Apex) from Payload, via `PricingInteractive` (see §8)
11. *Divider* (flipped)
12. **FAQ** — accordion, 6 real Q&As grounded in the actual pricing/billing terms
13. **ContactSection** — conditional email/social block (SiteSettings-driven) + `ContactForm`

**Not yet built:** any page besides the homepage. No `/blog`, no individual case-study pages, no `/pricing` or `/contact` standalone routes, no privacy/terms pages. `BlogPosts` collection exists in Payload with zero content and no route consumes it yet.

---

## 7. Backend / CMS

### Collections

| Collection | Slug | Purpose | Key fields |
|---|---|---|---|
| Users | `users` | Admin auth | (auth-only, no custom fields) |
| Media | `media` | Uploads | `alt` (required) |
| Leads | `leads` | Contact form submissions | `name`, `email`, `phone`, `company`, `businessType` (select), `interestedServices` (select, hasMany — real service categories), `monthlyAdBudget` (select), `message`, `preferredContactMethod` (select), `status` (select, sidebar), `formSource` (select: "Contact Form"/"Newsletter Footer", sidebar), `source` (UTM group, sidebar) |
| Services | `services` | Services section | `title`, `slug`, `shortDescription`, `fullDescription` (richText), `category` (select), `order`, `featured` |
| Pricing | `pricing` | Pricing section | `planName`, `tierLabel`, `price`, `currency`, `billingPeriod`, `priceNote`, `features` (array), `adSpendNote`, `popular`, `ctaLabel`, `order` |
| Testimonials | `testimonials` | Testimonials section | `clientName`, `role`, `company`, `quote`, `avatar`, `rating`, `resultStat`, `sampleData` (bool, sidebar) |
| CaseStudies | `case-studies` | Proof section | `title`, `slug`, `client`, `industry`, `coverImage`, `challenge`/`strategy` (richText), `results` (array of stat+label), `sampleData` (bool, sidebar) |
| BlogPosts | `blog-posts` | Not consumed by any route yet | `title`, `slug`, `excerpt`, `content` (richText), `coverImage`, `author`, `publishedDate`, `tags`, `seo` group |
| FAQs | `faqs` | FAQ section | `question`, `answer` (**textarea**, not richText — see §11), `category`, `order` |

**Global:** `SiteSettings` (`site-settings`) — `companyName`, `contactEmail`, `phone`, `whatsappNumber`, `address`, `socials` (instagram/linkedin/facebook), `defaultOgImage`, `analytics` (ga4Id/gtmId/metaPixelId/linkedInPartnerId). Everything except `companyName` is currently empty — populate via `/admin` when real values exist.

**Why Industries and Process aren't collections:** they're short, rarely-changing lists. Adding full CRUD collections for a handful of tags would be over-engineering relative to what actually needs non-technical editing. They live as typed arrays in `src/lib/content/`.

### Access control (`src/collections/access.ts`)

- `anyone` — public
- `isLoggedIn` — `({ req }) => Boolean(req.user)`

Pattern: content collections are `read: anyone, create/update/delete: isLoggedIn`. Leads is `isLoggedIn` on all four operations — public creation happens only through `/api/contact`'s Local API call with `overrideAccess: true`, not through collection-level access. Users is `isLoggedIn` on everything (Payload's built-in first-user bootstrap bypasses this for the very first account).

### Data flow

- **Server Components** read Payload directly via the Local API (`getPayloadClient()` in `src/lib/payload.ts`) — no HTTP round-trip. This is how every section fetches its data (Services, Pricing, Proof, Testimonials, FAQ, ContactSection's SiteSettings lookup).
- **Client Components** (the contact form, the footer newsletter form) POST to `/api/contact` (`src/app/api/contact/route.ts`) — a custom route that layers rate limiting, honeypot/timing spam defense, a field allow-list, and email notifications on top of a Local API `create` call. Payload's auto-generated `/api/leads` REST endpoint is now blocked for unauthenticated callers (`Leads.access.create: isLoggedIn`) since it had none of those protections — `/api/contact` is the only public path in. The only client-side data-fetching in the app.
- **Seeding:** `src/seed.ts` populates Services/Pricing/FAQs/sample Testimonials/sample CaseStudies. Run via `node --env-file=.env --import tsx src/seed.ts` (needs `CI=true` prefix if Drizzle's schema-push prompts interactively — see §12). It's idempotent-ish: checks `services` count and skips if already seeded.

---

## 8. Animations & effects catalog

| Effect | File | Mechanism | Scope |
|---|---|---|---|
| Hero 3D scene | `three/HeroScene.tsx` | R3F: 3 extruded bars + glowing trend-line tube, literally the logomark in 3D. Full 360° cursor-driven Y-rotation (`rotation.y = pointer.x * Math.PI`), entrance grow-in choreography. `frameloop` pauses via IntersectionObserver when scrolled off-screen. | Desktop + motion-ok only; `StaticMark.tsx` (the icon-badge SVG) is the fallback on mobile/reduced-motion, lazy-loaded via `next/dynamic({ssr:false})` either way |
| Kinetic grid | `effects/KineticGrid.tsx` | 2D canvas grid that warps toward the cursor and ripples on click. `position: fixed`, spans the **entire page** (not just Hero) — merges visually with the footer's glow near the bottom since both are viewport-fixed and z-index-layered correctly. Pauses on `document.hidden`, skips redraws once the cursor/ripples have fully settled (idle-optimization, since it now runs for the page's whole lifetime) | Whole page, all viewports; skipped under reduced-motion |
| Footer glow | `effects/GradientReveal.tsx` | Blurred SVG rainbow band pinned to the viewport floor; scales up from `minReveal` to full height as you approach the bottom of the page (`transform: scaleY()` driven by scroll position vs. remaining scroll distance). Colors are void→purple→violet→paper→neon→violet→fade — brand-only, not a literal rainbow | Footer only |
| Button glow | `.btn-glow` in `globals.css` | Rotating conic-gradient (purple→violet→neon→violet→purple) behind the button via `::before`, blurred, `opacity:0` at rest, revealed on `:hover`/`:focus-visible`. Uses `@property --glow-angle` for a smoothly animatable custom property | Primary `Button` variant only — secondary/ghost buttons stay quiet |
| Floating labels | `ui/AnimatedLabel.tsx` + `FloatingLabel{Input,Textarea,Select}.tsx` | Label text split into letters, each an independent `motion.span`; on focus or when the field has a value, letters stagger-translate up (`-130%`) and fade out. Real `<label htmlFor>` underneath, so it's still announced correctly regardless of the animation state | Every field in `ContactForm` |
| Scroll reveals | `motion/Reveal.tsx` | `whileInView` fadeUp, `viewport={{once:true, amount:0.2}}` | `SectionHeading` and most section content |
| Pricing numbers | `PricingInteractive.tsx` | `@number-flow/react`, `locales="en-IN"`, animates digit-by-digit when switching between plans | Pricing section |
| Accordion | `FAQAccordion.tsx` | Plain `motion.div` height/opacity animate on open/close (no `AnimatePresence` — see the gotcha in §11) | FAQ |

---

## 9. Coding conventions

- **TypeScript strict**, no `any`. Payload's generated types (`src/payload-types.ts`, regenerated automatically by `next dev`/`payload`) are the source of truth for collection shapes — import from `@/payload-types`, don't hand-write duplicate interfaces.
- **Server Components by default.** `"use client"` only where something actually needs it: hooks, browser APIs, event handlers, Framer Motion. Section components that just fetch-and-render (Services, Pricing, Proof, Testimonials, FAQ) are Server Components; interactive sub-pieces (ProofGrid's filter, FAQAccordion, PricingInteractive, ContactForm) are split out as client components underneath them.
- **No `cn()`/clsx.** Conditional classNames are plain template literals (`` `base ${condition ? "a" : "b"}` ``) — consistent throughout, no utility dependency for this.
- **No comments unless explaining non-obvious WHY.** No docstrings, no "what this does" comments where the code/naming already says it.
- **Styling:** Tailwind utility classes directly in JSX. Design tokens are CSS custom properties (`globals.css`, `:root` + `@theme inline`), never hardcoded hex in components except where matching a specific brand asset's own gradient stops (e.g., `GradientReveal`'s stops array, `KineticGrid`'s RGB constants) — those are documented inline as to why they're literal.
- **Motion:** import `EASE_PREMIUM` and shared variants from `components/motion/variants.ts` rather than redefining easing curves per-component. Use `Reveal` for scroll-triggered fades rather than hand-rolling `whileInView` each time.
- **Performance discipline:** anything with a continuous render/animation loop (R3F scene, KineticGrid) must have an explicit pause mechanism (visibility-based) — don't ship an animation loop that runs forever regardless of whether it's visible or the tab is backgrounded. Heavy client-only libraries (`@react-three/fiber`) are lazy-loaded via `next/dynamic({ssr:false})`, never in the initial bundle.
- **Real-data discipline:** never fabricate contact info, social links, client names, or "real-looking" stats. Placeholder/sample content gets a `sampleData`-style flag and a visible badge. Content that isn't populated yet (SiteSettings fields) renders nothing rather than a fake fallback.
- **Naming:** PascalCase components/files for components, camelCase for functions/hooks/variables, kebab-case for hook files under `lib/hooks/` (existing pattern: `use-media-query.ts`).

---

## 10. Local development

```bash
# Postgres (Homebrew, already installed)
brew services start postgresql@17
# db: scalwise_media, connection: postgresql://aditya0510@localhost:5432/scalwise_media

npm run dev            # Next.js dev server, http://localhost:3000
```

- `.env` holds `DATABASE_URL` and `PAYLOAD_SECRET` (gitignored, not committed — see `.env.example` for the shape)
- Admin panel: `http://localhost:3000/admin` — first run redirects to `/admin/create-first-user`. Payload's own bootstrap flow handles the first account; nothing in this codebase creates it for you.
- **Restart the dev server (not just hot-reload)** after: `next.config.ts` changes, `payload.config.ts`/collection schema changes, or any new `npm install`. Turbopack's fast refresh doesn't reliably pick these up.
- Typecheck: `npx tsc --noEmit`. Lint: `npm run lint`. Both should stay clean — treat new errors as blocking before moving on.

---

## 11. Production deployment

Live at [scalwise.online](https://scalwise.online), via Docker Compose on a Hostinger VPS — not Vercel. Vercel was the original plan (see §13's Sub-project 6a history and `docs/superpowers/specs/2026-08-22-scalwise-production-deployment-design.md`), abandoned mid-setup once it turned out the user already owned a VPS worth using instead of paying for/provisioning Vercel + Neon.

- **Shared VPS.** The server also runs an existing, unrelated n8n (workflow automation) instance, also via Docker Compose, reverse-proxied through the same Caddy container. n8n lives at `n8n.scalwise.online`, in `/opt/n8n/` on the server — never touch its containers or config when working on this app.
- **This app**: `/opt/scalwise/` on the VPS, a `git clone` of this repo. `docker-compose.yml` (committed here) defines two services: `scalwise-app` (built from this repo's `Dockerfile`) and `scalwise-postgres` (self-hosted Postgres — a deliberate choice over Neon, to keep everything on one server the user already owns). Only `scalwise-app` joins `n8n_default`, the Docker network n8n's compose project created (declared `external: true` here), so Caddy can reverse-proxy to `scalwise-app:3000` by container name without publishing any port to the host. `scalwise-postgres` stays isolated on its own `scalwise_internal` network (`internal: true`, no bridge to n8n) — n8n executes arbitrary user-authored HTTP calls/code, and this database holds every inbound sales lead, so it shouldn't be reachable from that network. `scalwise-app` bridges both networks.
- **Secrets** live in `/opt/scalwise/.env` on the VPS only (not committed) — `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`/`PAYLOAD_SECRET`/`RESEND_API_KEY`/`ADMIN_ALERT_EMAIL`, all distinct from local dev's `.env`.
- **HTTPS** is entirely Caddy's automatic HTTPS (Let's Encrypt) — one block appended to `/opt/n8n/caddy/Caddyfile` (lives on the server, not in this repo) routes `scalwise.online` and `www.scalwise.online` to `scalwise-app:3000`.
- **Media storage**: local disk, at `media/` (repo root — see the gotcha below), persisted via the named Docker volume `scalwise_media` so uploads survive image rebuilds (the `scalwise_postgres_data` volume does the same job for the database, surviving container rebuilds the same way). The Vercel Blob storage plugin from Task 2 (`payload.config.ts`'s conditional `vercelBlobStorage`) is still present but dormant here — it only activates if `BLOB_READ_WRITE_TOKEN` is set, which it isn't on this deployment.
- **No automated backups.** The self-hosted Postgres database has no `pg_dump` cron or equivalent — a known gap from moving off Neon's managed backups, not yet addressed.
- **Redeploying**: on the VPS, `cd /opt/scalwise && git pull && docker compose up -d --build` — rebuilds the image and restarts the app container. `payload migrate` runs automatically at container start (before `next start`), not at image-build time — the database isn't reachable during the isolated Docker build stage. The `npm run build` script in `package.json` (plain `next build`) isn't used anywhere in this path either — the Docker build runs `next build` directly, unaffected by that script. It used to be `payload migrate && next build`, which broke locally with a "relation already exists" error against the push-synced dev database (`payload migrate` doesn't know that database's schema was already push-synced); reverted to plain `next build` for that reason. SSH access for deploys has been handled per-session: a dedicated key gets added to the VPS's `authorized_keys` for the duration of the work and removed once it's done (the private half never persists anywhere durable regardless). A future session needs a fresh key added the same way, or the user redeploys manually with their own SSH access using the command above.
- **Seeding**: the production DB is a separate, empty database from local dev — it needs its own seed run. On the VPS: `docker exec -d scalwise-app sh -c 'cd /app && CI=true npx tsx src/seed.ts > /tmp/seed.log 2>&1'`, then check `/tmp/seed.log`.

---

## 12. Known issues / gotchas worth remembering

- **Adding a field to a Payload collection's config is not enough for production — it needs its own migration too, or the column never exists there.** Local dev picks up config changes automatically via `next dev`'s schema push; production only ever applies schema changes through committed migrations (§11). Sub-project 3 added `formSource` to `Leads.ts` without generating a migration for it, and production's `/api/contact` route returned 500 on every real submission (confirmed via a live request against `https://scalwise.online/api/contact`) until `CI=true npx payload migrate:create <name>` was run and the resulting migration deployed. **Any future field/collection change needs a matching migration in the same commit, not just the config edit** — this is easy to forget because local dev never surfaces the gap.
- **`Media.ts`'s `staticDir: "media"` resolves to `media/` at the repo root, not `public/media/`.** Cost real debugging time during deployment: a verification script checked for uploaded files at the assumed `public/media/` path, found nothing, and that false negative got misread as a finding about Payload's storage-adapter architecture before the actual path was found by checking the filesystem directly.
- **`next build` attempts to statically prerender pages by default — including ones that call `getPayloadClient()` at render time.** Works fine on Vercel (env vars + the DB are both reachable during Vercel's build step), but fails with "missing secret key" in an isolated Docker build stage, where neither is available. Fixed by adding `export const dynamic = "force-dynamic"` to `(site)/page.tsx`, which matches the architecture already described in §7 (Server Components fetch via the Local API at request time — this just makes that explicit instead of leaving it to Next.js's default static-optimization attempt).
- **`AnimatePresence` + a single always-mounted child + changing `key` + `mode="wait"` can permanently freeze.** Hit this in `PricingInteractive` — the feature panel would update its selection indicator correctly but freeze on the first plan's content forever after one switch. Root cause: the exit animation never resolved, so AnimatePresence never progressed to the next child. Fix: drop `AnimatePresence` for this pattern, use a plain `motion.div` with a changing `key` — React handles the mount/unmount directly, Framer Motion only handles the enter transition. `FAQAccordion` uses a *different*, safe pattern (conditional render, not a changing key on an always-mounted child) and was never affected.
- **`@payloadcms/db-postgres`'s `postgresAdapter()` takes `{ pool: { connectionString } }`, not a flat `{ url }`.** A fetched doc summary suggested `url` — that was wrong (or for a different version). Verified against the actual installed type definitions (`node_modules/@payloadcms/db-postgres/dist/types.d.ts`) after it silently connected to the wrong database. When in doubt, check the installed type defs, not a fetched summary.
- **Seed scripts must not call `process.exit()` right after async work.** `src/seed.ts` originally called `process.exit(0)` at the end and silently wrote nothing — the process was killed before pending writes/logs flushed. Fixed by using `process.exitCode` and letting the event loop drain naturally (the process then hangs on an open DB connection, which is expected — kill it manually or let the caller's timeout handle it).
- **`FAQs.answer` is a `textarea`, not `richText`.** Started as richText, but seeding plain strings into a Lexical richText field throws a validation error (it expects a structured document, not a string). Textarea is also just the right fit for short FAQ answers.
- **Two logo files in the brand folder (`scalwise-logo-primary.svg`, `scalwise-logo-reversed.svg`) have a base64 font embedded from export** — hundreds of KB each. Deliberately not used anywhere in the site. The header/footer wordmark is live text (Space Grotesk, already self-hosted) next to the small, clean `scalwise-icon.svg`/`scalwise-icon-badge.svg` instead.
- **The in-app browser preview tool used for verification has a recurring flakiness pattern:** screenshots taken right after a scroll/navigate sometimes render solid black or stale. A tiny `resize_window` call forces a repaint and fixes it. Not a real app bug — confirmed multiple times via `get_page_text`/direct DOM inspection returning correct content while the screenshot itself was blank.
- **A custom route that wraps a Payload Local API `create()` call doesn't automatically inherit the protections its own hardening was meant to add, if the collection's REST endpoint and access control are left untouched.** The final whole-branch review of sub-project 3 found that `Leads.access.create` was still `anyone`, so Payload's auto-generated `POST /api/leads` REST endpoint remained fully public with none of `/api/contact`'s rate limiting, spam checks, or field restrictions — anyone who knew (or guessed) Payload's standard REST convention could bypass the entire hardening effort. Compounding that, `/api/contact` spread the *entire* request body into `payload.create()`, so a public POST could set staff-managed fields like `status` directly. Both are now fixed: `Leads.access.create` is `isLoggedIn` (closing the REST bypass), `/api/contact` calls `payload.create()` with an explicit `overrideAccess: true` (documenting, not just defaulting into, the intentional bypass for its own vetted path) and an explicit field allow-list (`ALLOWED_LEAD_FIELDS` in `route.ts`). **Any future route that wraps Local API writes on top of a public-facing collection needs to close the collection's own REST access at the same time, and allow-list — never spread — the request body into `data`.**
- **Fallback defaults for "missing/invalid input" can accidentally defeat the exact check they're guarding.** The original spam-check call was `formRenderedAt: formRenderedAt ?? 0`, intended to avoid a crash when the field was absent — but `Date.now() - 0` is always huge, so a bot that omits the timing field entirely (the simplest bypass) sailed straight through the "submitted too fast" check meant to catch it. Fixed by defaulting a missing/invalid timestamp to `Date.now()` instead of `0`, which reads as an *instant* (0ms-elapsed, correctly spam-flagged) submission rather than an old one. When a fallback exists purely to prevent a crash, check what value the fallback actually asserts about the input — "missing" and "legitimate zero" are not the same thing.

---

## 13. Roadmap / pending work

Originally scoped as sub-projects; 1, 2, and 3 are done, plus the interactive/animation enhancements requested after 2 (pricing widget, kinetic grid, glow buttons, animated contact form). Sub-project 6 turned out to bundle two unrelated things — deployment, and SEO/perf/accessibility polish — and was split during brainstorming since deployment had to land first (see `docs/superpowers/specs/2026-08-22-scalwise-production-deployment-design.md`). 6a is also done; the rest is remaining:

### Sub-project 3 — Lead-gen backend hardening (done)
Honeypot + timing spam defense, in-memory rate limiting (chosen over the originally-planned Upstash Redis once the app was running as a persistent VPS process rather than serverless — see `docs/superpowers/specs/2026-08-22-scalwise-lead-gen-hardening-design.md`), and Resend-based email notifications (confirmation to the lead, alert to the admin) all live on `/api/contact`, which both the contact form and the footer newsletter form now POST to instead of Payload's `/api/leads` directly.

### Sub-project 4 — Admin/CMS content population
- Real testimonials and case studies to replace/supplement the sample-flagged ones
- Real business contact info (email, phone, WhatsApp number, address) into `SiteSettings`
- Real client logos for the Trust strip (currently shows platform names only, no client logos — none exist yet)
- Lead magnet asset (still undefined — the Contact section's secondary/lighter CTA was deferred until this exists)

### Sub-project 5 — Integrations
- WhatsApp floating button (click-to-chat)
- Calendly/booking integration
- Analytics: GA4 + GTM + Meta Pixel + LinkedIn Insight Tag, all through one GTM container (per the original architecture decision) — `SiteSettings.analytics` fields exist but nothing reads them yet

### Sub-project 6a — Production deployment (done)
Live at [scalwise.online](https://scalwise.online) — see §11 for the architecture. Landed on a Hostinger VPS instead of the originally-planned Vercel/Neon, once it turned out the user already owned a VPS.

### Sub-project 6b — SEO, performance, accessibility (not started)
- Per-route metadata beyond the basic title/description, `sitemap.ts`, `robots.ts`, JSON-LD (Organization/LocalBusiness, FAQPage, Article), OG images
- Formal Lighthouse pass (target 95+, per the original brief) — not yet run, and only meaningful against the real deployment now that one exists
- Accessibility audit beyond the ad hoc checks done during build (focus states, `prefers-reduced-motion`, semantic labels have been handled inline throughout, but no formal pass)

### Smaller open items
- Additional pages: individual case-study detail pages, `/blog` + post pages, `/pricing`, `/contact`, privacy/terms — currently everything lives on the one homepage
- `npm audit` reported some moderate vulnerabilities in transitive deps early on — not yet triaged
- Currency/market assumption (India/INR) — stated, not explicitly confirmed by the user
