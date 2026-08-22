# Scalwise Media — Production Deployment (Sub-project 6a)

Sub-project 6 of 6 in the original roadmap ("SEO, performance, accessibility, deployment") was split in two during brainstorming: deployment is a hard prerequisite for the rest (Lighthouse/accessibility numbers from `next dev` aren't representative of production, and the sitemap/OG work needs a real canonical URL). This spec covers **6a — getting the existing site live**. SEO/performance/accessibility hardening against the live deployment is **6b**, a separate future spec.

Related: [`PROJECT_CONTEXT.md`](../../../PROJECT_CONTEXT.md) is the living reference for the whole codebase. [`2026-08-22-scalwise-foundation-design.md`](2026-08-22-scalwise-foundation-design.md) is the original foundation spec.

---

## 1. Goal

Get the current homepage + Payload admin live on the public internet, running against real production Postgres, with a stable-enough foundation (real migrations instead of dev-mode schema push, working file uploads) that 6b can iterate against via auto-deploy-on-push.

Explicitly not the goal of this pass: a custom domain, any SEO/metadata work, a Lighthouse or accessibility pass, or anything from sub-projects 3/4/5. Those are separate, later work — see §7.

## 2. Current state (as of this spec)

- Code is on GitHub: [`Aditya-051028/Swastik-Website`](https://github.com/Aditya-051028/Swastik-Website), `main` branch, pushed and tracked as `origin/main`. (Repo name doesn't match the project's brand name — flagged during brainstorming; the user supplied the URL directly and didn't correct it, so treated as intentional.)
- No Vercel project exists yet.
- Local dev runs against Homebrew Postgres (`postgresql://aditya0510@localhost:5432/scalwise_media`); no managed/production Postgres exists.
- No `migrations/` directory exists anywhere in the repo — the project has only ever used Payload's dev-mode schema push (`next dev` auto-syncs schema to the local DB).
- `Media` collection (`src/collections/Media.ts`) uses local-disk storage (`upload: { staticDir: "media" }`), no cloud storage adapter installed.
- `package.json`'s `build` script is plain `next build` — no migration step wired in.

## 3. Infrastructure components

| Component | Decision | Why |
|---|---|---|
| Source control | GitHub repo (already pushed) + Vercel's Git integration | Every `git push` to `main` auto-deploys; PRs get preview URLs. Chosen over a CLI-only deploy specifically because 6b will be an iterate → push → check Lighthouse → repeat loop, and auto-deploy removes a manual step from every iteration. |
| Hosting | Vercel, new project imported from the GitHub repo | Matches the architecture decision already made in the foundation spec (`Deploy target: Vercel`). |
| Database | Neon Postgres, provisioned through **Vercel's native Neon integration** (not a separate Neon account + manually pasted connection string) | One less account to manage by hand; the integration wires `DATABASE_URL` into the Vercel project automatically. Matches the foundation spec's original choice of Neon. |
| File storage | Vercel Blob, provisioned through the Vercel dashboard | Needed because Vercel's serverless filesystem is ephemeral/read-only at runtime — local-disk uploads would not survive a cold start or the next deploy. See §5. |
| Domain | None yet — deploy to the default `<project>.vercel.app` URL | No domain purchased yet (confirmed during brainstorming). Adding a custom domain later is a Vercel dashboard change, not a code change, so it's not blocking. |

## 4. Schema migrations

The installed `@payloadcms/db-postgres` adapter (verified against `node_modules/@payloadcms/db-postgres/dist/types.d.ts`, not assumed from memory) supports `migrationDir` and `prodMigrations` options specifically for this, alongside the `push` boolean that dev mode uses. Plan:

1. Generate an initial migration with `payload migrate:create` against the current schema (7 collections + `SiteSettings` global). This produces files under a new `migrations/` directory, which get committed to git.
2. Wire the Vercel build to run `payload migrate` before `next build`, so migrations apply as part of every deploy rather than relying on push in production. Exact mechanism (a `vercel-build` package.json script vs. a custom build command in Vercel project settings) gets confirmed against current Vercel docs during implementation rather than assumed here.
3. Local dev is unaffected — `next dev` keeps using push-based sync exactly as today.

**Rollback posture:** no down-migrations authored proactively (YAGNI — nothing in the current schema is risky enough to warrant it). Vercel doesn't cut traffic over to a new deployment until its build succeeds, so a failing migration fails the *build* and the previously-live deployment keeps serving traffic — there's no scenario where a bad migration takes the live site down. If a bad migration does land and get deployed, the fix is a new forward migration, not a rollback.

## 5. Media storage

Add `@payloadcms/storage-vercel-blob` to `payload.config.ts` (verified via `npm view`: version `3.88.0`, peer dependency `payload: 3.88.0` — matches the installed Payload version exactly). Enabled only when `process.env.BLOB_READ_WRITE_TOKEN` is set, so:

- On Vercel (where the token is auto-injected by the Blob integration): uploads go to Blob storage and persist across deploys/cold starts.
- Locally (no token set): `Media` keeps using local-disk `staticDir` storage exactly as today — no change to the local dev workflow.

## 6. Environment variables

Set in the Vercel project's dashboard, never committed (the repo's `.gitignore` already excludes all `.env*` files):

| Variable | Source |
|---|---|
| `DATABASE_URL` | Auto-set by the Vercel↔Neon integration |
| `BLOB_READ_WRITE_TOKEN` | Auto-set by the Vercel↔Blob integration |
| `PAYLOAD_SECRET` | Freshly generated random string for production — **not** the placeholder currently in the local `.env` |

## 7. Explicitly out of scope for this pass

Deferred to 6b (separate future spec): custom domain, per-route metadata, `sitemap.ts`/`robots.ts`, JSON-LD, OG images, the Lighthouse pass, the accessibility audit and any fixes it turns up.

Deferred to their own sub-projects, untouched here: sub-project 3 (honeypot/rate-limiting/email notifications — no Upstash or Resend env vars are part of this deploy), sub-project 4 (real content), sub-project 5 (WhatsApp/Calendly/analytics).

## 8. Deploy flow

1. Generate the initial Payload migration locally, commit it (§4).
2. Add the `@payloadcms/storage-vercel-blob` dependency and conditional wiring in `payload.config.ts` (§5), commit it.
3. Import the GitHub repo into a new Vercel project (dashboard).
4. Add the Vercel↔Neon integration to that project (provisions the DB, sets `DATABASE_URL`).
5. Add a Vercel Blob store to the project (sets `BLOB_READ_WRITE_TOKEN`).
6. Set `PAYLOAD_SECRET` manually in the Vercel dashboard.
7. Push (or redeploy) — Vercel build runs migrations, then `next build`, then goes live at `<project>.vercel.app`.

Steps 3–6 require your Vercel login and are dashboard actions I'll walk you through rather than perform for you.

## 9. Verification (post-deploy)

- Homepage loads at the `.vercel.app` URL and every section renders — since sections fetch via Payload's Local API server-side, this alone confirms the DB connection and migrations worked.
- `/admin/create-first-user` bootstrap flow works — you create the real production admin account. (This has to be you; it's account creation.)
- Upload a test image against a collection in `/admin` — confirms Blob storage is wired correctly.
- Submit the live contact form — confirms the public `create` path on `Leads` works against production Postgres.

## 10. What needs you specifically

- Vercel login (dashboard steps in §8)
- Approving/creating the Neon integration and Blob store through Vercel's dashboard
- Creating the production admin account via the bootstrap flow — not something I can do on your behalf
