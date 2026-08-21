# Scalwise Media — Foundation & Design System

Sub-project 1 of 6 in the full site build. Status: approved, in progress.

## Roadmap (context for this spec)

1. **Foundation & Design System** (this spec) — architecture, tokens, content model, Hero
2. Homepage build-out — remaining 10 sections
3. Lead-gen backend hardening — spam/rate-limit/email polish
4. Admin/CMS content population + refinement
5. Integrations — WhatsApp, Calendly, analytics/pixels
6. SEO, performance, accessibility hardening, deployment

## Brand system (source of truth: `Scalwise Brand/Scalwise brand guidelines/`)

- **Name**: Scalwise Media (wordmark "SCALWISE" + "MEDIA" tag)
- **Tagline**: "Scale Smarter"
- **Positioning**: Turn ad spend and content into predictable growth for local and D2C brands — through performance ads, GBP/local SEO, and content that actually converts.
- **Pillars**: Performance ("numbers, not noise") · Strategy ("wise before wide") · Execution ("bold, fast, visible")
- **Voice**: direct not salesy, numbers over adjectives, confident not arrogant
- **Market/currency**: India / INR (₹), inferred from the guidelines' own copy examples — revisit if wrong

### Palette

| Token | Hex | Usage |
|---|---|---|
| Void | `#12051F` | Dominant background — 60% |
| Void-2 | `#1B0733` | Secondary background / gradient stop |
| Void-3 | `#210A3D` | Elevated surfaces, cards |
| Signal Purple | `#5B21B6` | Primary brand color — 30% |
| Vivid Violet | `#9061F9` | Gradients, highlights |
| Neon Volt | `#D4FF3D` | Accent only — CTAs, stats, hover glow — 10% |
| Lavender | `#B7A9D6` | Secondary text, captions |
| Paper | `#F7F4FC` | Light surfaces, reversed text |
| Line | `rgba(247,244,252,0.10)` | Hairline borders, glass edges |

### Type

- **Space Grotesk** (500/700) — display: H1 56–78px, H2 32–40px, H3 18–20px, tight tracking on caps
- **Inter** (400/600) — body: 15–17px
- **JetBrains Mono** (400/500/700) — eyebrows/labels/stats: 11–12px, always uppercase + tracked

### Logo

Three ascending bar polygons (purple gradient `#5B21B6→#9061F9`) cut by one diagonal trend-line stroke (Neon Volt, glow filter). Clear space = tallest bar's height. Min size 24px icon / 120px full lockup. Never stretch, recolor, rotate, or place on low-contrast backgrounds.

## Architecture

**Single Next.js app (App Router, TypeScript, React 19). Payload CMS 3 embedded at `/admin`. Postgres (Neon) as the datastore. No monorepo, no separate backend service.**

Rejected alternatives:
- Headless SaaS CMS (Sanity) + separate custom leads dashboard — two admin surfaces instead of one.
- Fully hand-rolled Prisma + bespoke admin UI — reinvents auth/RBAC/uploads/rich-text that Payload ships for free.

Supporting choices: Tailwind CSS v4, Framer Motion (all animation), React Three Fiber + drei (Hero scene only, lazy-loaded, performance-first hybrid per prior decision — full spectacle traded for guaranteed 95+ Lighthouse), Resend + react-email (transactional email, wired in sub-project 3), Upstash Redis (rate limiting, wired in sub-project 3), GTM as the single container for GA4 + Meta Pixel + LinkedIn Insight Tag (wired in sub-project 5).

## Folder structure

```
src/
  app/
    (site)/            → homepage, /case-studies, /blog, /pricing, /contact, legal pages
    (payload)/          → Payload admin UI + its API (installer-generated)
    api/contact/         → lead-gen endpoint (validation, rate limit, honeypot) — sub-project 3
    sitemap.ts, robots.ts
  collections/           → Payload schemas: Leads, Services, Pricing, Testimonials,
                            CaseStudies, BlogPosts, FAQs, SiteSettings
  components/
    ui/                  → primitives: Button, Card, GlassPanel, Badge, Input
    sections/             → Hero (this pass), Services/Proof/Pricing/etc. (sub-project 2)
    motion/                → reusable Framer Motion variants
    three/                  → R3F hero scene (lazy-loaded)
  lib/                    → payload client, email, rate-limit, validation
  payload.config.ts
```

## Design tokens

- **Spacing**: 96px section padding, 48px container gutter, 56px header-to-content gap (matches the brand guidelines doc's own rhythm), 4px base scale underneath.
- **Radii**: 16–20px cards/panels, full-round pills/badges.
- **Elevation**: purple-tinted ambient shadow for lift (`rgba(91,33,182,.45)`); Neon Volt glow reserved for interactive/hover states only (CTAs, active nav, focus rings) — never ambient.
- **Glass panels**: void-3 background ~65% opacity + backdrop-blur, border = `--line` token.
- **Motion**: expo-out easing `cubic-bezier(.16,1,.3,1)` for entrances; 150–250ms micro-interactions; 500–700ms section reveals; 60–80ms stagger per child; reveal triggers **once**, no replay on scroll-back; full `prefers-reduced-motion` fallback to opacity-only crossfades.

## Content model (Payload collections)

- **Leads**: name, email, phone, company, businessType (select), monthlyAdBudget (select), message, preferredContactMethod (select), utm fields, status (new/contacted/qualified/won/lost)
- **Services**: title, slug, icon, shortDescription, fullDescription (richText), category, order, featured
- **Pricing**: planName, tierLabel, price, billingPeriod, features[], adSpendNote, popular flag, ctaLabel — seeded from real data below
- **Testimonials**: clientName, role, company, quote, avatar, rating, resultStat, `sampleData` flag
- **CaseStudies**: title, slug, client, industry, coverImage, challenge, strategy, results[], `sampleData` flag
- **BlogPosts**: title, slug, excerpt, content (richText), coverImage, author, publishedDate, SEO fields, tags
- **FAQs**: question, answer (richText), category, order
- **SiteSettings** (global): companyName, logo refs, contactEmail, phone, whatsappNumber, address, socials, default SEO/OG image, analytics IDs

### Pricing seed data (real — `Scalwise Brand/scalwise-packages.html`)

Productized content + Meta Ads packages. Broader services (SEO, web dev, automation, etc.) are framed as custom-scoped engagements per the source doc's own footnote ("Custom scopes available on request") — not part of this pricing table.

Founding-client badge copy: "Founding-client pricing — locked in for your first cohort, revised after."

| | Liftoff | Ascent (Recommended) | Apex |
|---|---|---|---|
| Tier label | Get discovered | Build momentum | Own the market |
| Price | ₹14,999/mo + tax | ₹21,999/mo + tax | ₹27,999/mo + tax |
| Reels/mo | 10 | 12 | 18 |
| Static creatives | 5 | 8 | 12 |
| Calendar | Basic posting/calendar | Content calendar | Full content calendar |
| Captions/scripts | Captions | Captions & scripts | Scripts & captions |
| Instagram | Basic profile optimization | Optimization | + GBP management |
| GBP | — | Support | Included (see Instagram row) |
| Meta Ads | — | Basic setup & management | Optimization |
| Extra | Monthly performance summary | Offer/funnel planning: no; Weekly reporting | Offer/funnel planning; Weekly performance review |
| Ad spend note | — | Covers up to ₹15,000/mo Meta spend, +12% beyond, billed direct to Meta | Covers up to ₹40,000/mo Meta spend, +12% beyond, billed direct to Meta |

Footnote (render verbatim near the pricing table): "All plans billed monthly · GST/applicable taxes extra · Meta/Google ad spend billed separately, paid direct to platform · Founding-client pricing, subject to revision after the first cohort · Custom scopes available on request"

## Homepage IA (reworked — full reference, sections 2–11 built in sub-project 2)

1. Hero (this pass) 2. Trust strip 3. Services 4. Industries 5. Process 6. Proof (merges Case Studies/Portfolio/Results) 7. Testimonials (+ blog preview strip) 8. Why Scalwise (merges About/Why ScaleWise) 9. Pricing 10. FAQ 11. Final CTA/Contact (+ lead magnet as secondary CTA)

## This pass: definition of done

- Next.js app scaffolded, Tailwind v4 wired to the token set above, three fonts self-hosted via `next/font`
- Payload CMS running locally against Postgres (Neon), all 7 collections + SiteSettings defined (schemas only — content population is sub-project 4)
- Base app layout: header/nav shell, footer shell
- Hero section fully built: copy, layout, R3F logomark scene (lazy-loaded, mobile/reduced-motion fallback), entrance choreography, responsive
- Dev server verified in-browser at desktop + mobile widths

**Out of scope this pass** (later sub-projects): remaining 10 homepage sections, contact form backend/email/spam protection, admin UI content population, WhatsApp/Calendly/analytics integrations, SEO/deployment hardening.

## Open items / carried assumptions

- Currency/market assumed India/INR — confirm if wrong
- Lead magnet asset undefined — needed before sub-project 2's Final CTA section
- Real business contact info (phone, WhatsApp number, address) not yet provided — `SiteSettings` seeded with placeholders until supplied
- Case study / testimonial content: placeholder, `sampleData`-flagged until real client results are provided
