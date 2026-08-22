# Project Handoff

Read this before making changes. Also read `SRS.md` (source of truth for product
requirements) and `README.md` (setup instructions) in the repo root.

## 1. Project Purpose & Business Goal

A content publishing platform for software engineering jobs, interview
preparation, system design, and developer knowledge. Traffic model: social
media (Instagram) → website → useful content → repeat visits → organic
search → **Google AdSense monetization**. The site must read as a
legitimate, useful developer/career publication — not a social network, not
a generic admin dashboard. Owner publishes and manages all content through
an admin CMS, no code changes required per post/job.

GitHub repo name is `devcareer-hub`; the product's own display name
(`NEXT_PUBLIC_SITE_NAME`, SRS.md) is "Developer Jobs & Knowledge Publishing
Platform" — these are just two labels for the same project, not a rename in
progress.

## 2. Architecture & Tech Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS 4**
- **MongoDB Atlas** + **Mongoose 9** (no PostgreSQL/Prisma)
- Deploy target: **Vercel** (not yet deployed — see §12)
- No Express, Redis, Elasticsearch, or other infrastructure — deliberately a
  lightweight modular monolith per SRS.md §33.
- **Architecture note:** this Next.js version is materially newer than most
  training data. Before writing framework-level code, check
  `node_modules/next/dist/docs/` (see `AGENTS.md` at repo root) rather than
  assuming older App Router conventions — several APIs here (async
  `params`/`searchParams`, `proxy.ts` replacing `middleware.ts`, `PageProps`
  helper) differ from pre-2025 Next.js.

Request flow: `Public UI / Admin UI → Service Layer (src/lib/services) →
Mongoose Models (src/lib/db/models) → MongoDB Atlas`. Pages never import
Mongoose models directly.

## 3. Project Conventions

- **Service layer is the only DB access path.** Every service file starts
  with `import "server-only"` (see exception below) and lives in
  `src/lib/services/`. Pages/Server Actions call services, never `Model.find`
  directly.
- **`server-only` is NOT used in `src/lib/db/connect.ts`, the model files, or
  `src/lib/auth/session.ts` / `src/proxy.ts`.** The `server-only` package
  throws unconditionally outside a bundler context that sets the
  `react-server` export condition — it breaks plain Node/tsx execution
  (`scripts/seed.ts`) and `proxy.ts`, which run outside Next's normal
  webpack/Turbopack build. Verified empirically; don't add it back to those
  files.
- **Never spread a Mongoose hydrated document** (`{...doc}`). In this
  Mongoose version, schema fields are exposed via getters, not
  own-enumerable properties, so spreading silently drops every field. Build
  plain objects explicitly instead (see `toPostCardData` in
  `src/components/content/PostCard.tsx` for the pattern).
- **Validation:** Zod schemas in `src/lib/validation/`, run inside service
  functions via `parseInput()` (throws `ValidationError`). Update schemas use
  `.nullable()` on single-value optional refs (e.g. `Post.category`,
  `Job.deadline`) so the CMS can explicitly clear a field — plain omission
  means "leave unchanged" (`Object.assign` semantics in `updatePost`/
  `updateJob`).
- **Errors:** `src/lib/errors.ts` defines `AppError` and subclasses
  (`ValidationError`, `NotFoundError`, `DuplicateSlugError`, `InvalidIdError`,
  `DatabaseError`). `toAppError()` converts raw Mongo/Mongoose errors (e.g.
  E11000 duplicate key) into these. Server Actions catch `AppError` and
  return `error.message` to the form; anything else is logged server-side
  and replaced with a generic message. Raw DB errors never reach a response.
- **URLs:** `urlSchema` (`src/lib/validation/shared.ts`) requires http/https
  only — rejects `javascript:`, `data:`, `file:`, etc. Used by
  `Job.applicationUrl` and both Post/Job `seo.canonicalUrl`. `ApplyButton`
  also re-validates the protocol at render time (defense in depth).
- **Admin CMS pattern** (Posts and Jobs both follow this): list page with
  search/filter/pagination → `/new` and `/[id]/edit` forms (Client Component
  wrapping `useActionState` + a Server Action) → explicit intent buttons
  (`Save Draft` / `Update` / `Publish` / `Archive`, submitted via
  `<button name="intent" value="...">`) so a save can never accidentally
  change publish status → `/[id]/preview` (admin-only, `noindex`, reuses the
  same header/content components the public page uses, no separate render
  path) → delete via a small Client Component that calls `window.confirm()`
  before submitting.
- **Content rendering:** `src/components/content/ContentRenderer.tsx` is a
  **hand-rolled safe Markdown subset** renderer (headings, paragraphs,
  bold/italic, inline code, fenced code blocks, blockquotes, lists, tables,
  links, images — http/https only). No `dangerouslySetInnerHTML` anywhere.
  Deliberately not a real Markdown library (avoided a ~100-package
  dependency tree). The admin `MarkdownEditor` component reuses this same
  renderer for live preview — do not build a second renderer.
- **Dates:** always format via `toISOString().slice(0,10)` for
  `<input type="date">` values (`toDateInputValue` in `src/lib/format.ts`),
  never local getters — avoids a server-timezone off-by-one-day bug.
- **Styling:** shared tokens in `src/lib/styles.ts` (`buttonClasses`,
  `badgeClasses`, `cardClasses`, `inputClasses`, table classes). No
  component library; plain Tailwind utility classes composed via `cn()`.
- **Minimal client JS:** most pages are Server Components; forms use native
  `<form action={serverAction}>` wherever possible. `"use client"` only where
  real interactivity is needed (nav toggles, the CMS forms, the Markdown
  editor's write/preview tabs).

## 4. Database Models

All in `src/lib/db/models/`, Mongoose, `timestamps: true` unless noted.

| Model | Key fields | Notes |
|---|---|---|
| `User` | name, email (unique), passwordHash (`select:false`), role | `role` enum is `["ADMIN"]` only — no other roles exist yet |
| `Post` | title, slug (unique), type, excerpt, content, category (ref Category), tags (ref Tag[]), featuredImage (ref Media), seo{metaTitle,metaDescription,canonicalUrl}, status, author (ref User), publishedAt | `type` ∈ BLOG / INTERVIEW_PREP / SYSTEM_DESIGN / GUIDE / CAREER |
| `Job` | title, slug (unique), company, location, experience, salary, employmentType, description, requirements[], applicationUrl, source (plain text label, **not** a URL), deadline, featuredImage (ref Media), seo{...}, status, publishedAt | No category/tags — Job never had these fields, don't add them without a schema change |
| `Category` | name, slug (unique), description | No status field |
| `Tag` | name, slug (unique) | No status field |
| `Media` | filename, url, type, size, altText | `timestamps: {createdAt: true, updatedAt: false}`. **No upload path exists yet** — model only, always empty in practice |

Shared: `status` ∈ DRAFT / PUBLISHED / ARCHIVED (`src/lib/db/enums.ts`
`CONTENT_STATUSES`), applies to Post and Job. `employmentType` ∈ FULL_TIME /
PART_TIME / INTERNSHIP / CONTRACT (`EMPLOYMENT_TYPES`). SEO subdocument
schema shared via `src/lib/db/schemas/seo.ts`.

Relationships are references (ObjectId), not embedded — no `.populate()` is
used; pages resolve names via `buildIdMap()` (`src/lib/format.ts`) against a
separately-fetched list (categories/tags/users are small, cheap to fetch in
full).

## 5. Authentication & Authorization

- **Stateless, HMAC-SHA256-signed session cookie** — no session store, no
  auth framework/library. Implemented in `src/lib/auth/session.ts`
  (sign/verify token) and `src/lib/auth/auth.ts` (`createSession`,
  `destroySession`, `getCurrentUser`, `requireAdmin`).
- `src/lib/auth/credentials.ts` holds `authenticateAdmin()` — deliberately
  split out from `auth.ts` because `auth.ts` imports `next/headers`/
  `next/navigation`, which only work inside a real Next.js request; the
  split keeps credential-checking logic testable in isolation.
- Cookie name `admin_session`, `httpOnly`, `secure` in production only,
  `sameSite: lax`, 7-day expiry. Session payload: `{sub: userId, role, exp}`,
  verified with `crypto.timingSafeEqual`. No DB lookup on every request —
  purely cryptographic. **Implication:** revoking a session before natural
  expiry isn't possible (no server-side blocklist); logout just deletes the
  cookie.
- Unknown-email vs wrong-password both throw the same `InvalidCredentialsError`
  → identical generic "Invalid email or password." message. A dummy bcrypt
  comparison runs even for unknown emails to reduce timing-based account
  enumeration.
- **Two-layer protection:** `src/proxy.ts` (matcher `/admin/:path*`, always
  allows `/admin/login` through) redirects unauthenticated requests at the
  edge; `requireAdmin()` is also called inside the admin `(dashboard)` layout
  as a second, independent check (Next's own docs warn a matcher change can
  silently drop proxy coverage).
- Basic in-memory rate limiting on login (`src/lib/auth/rateLimit.ts`, 5
  attempts / 5 min). **Verified NOT reliably effective** — empirically, 8
  consecutive login attempts in one local `next dev` session never tripped
  it, and it categorically won't work across separate Vercel serverless
  instances. Provides some friction on a single-process deployment only. A
  real fix needs a distributed store (Vercel Firewall rate limiting, or
  Redis/Upstash) — out of scope by design (SRS explicitly excludes Redis).
- Admin creation is `npm run seed` only — no registration UI, no password
  reset, no multi-admin support.

## 6. Public Routes

All under `src/app/`, wrapped by the root layout (public Header/Footer via
`SiteChrome`, which hides that chrome for `/admin/*`).

```
/                         Homepage (hero, search, latest jobs/posts, categories)
/jobs                     Job listing (filters: location, company, employment type)
/jobs/[slug]              Job detail (published only; 404 for draft/archived/missing)
/blog, /interview-prep, /system-design       Post listings by type
/blog/[slug], /interview-prep/[slug], /system-design/[slug]   Post detail (published only)
/search                   Basic in-memory title/company/location substring match
                          over recent published posts+jobs — not real full-text search
/about /contact /privacy-policy /terms       Static trust pages
```

`ContentStatus` gating for all detail routes: only `PUBLISHED` is servable;
draft/archived → clean `notFound()` (branded `src/app/not-found.tsx`, not a
raw error). No content pages are statically generated — all dynamic
(`force-dynamic` or driven by `searchParams`), so there's no cache to
revalidate after a CMS write.

## 7. Admin Routes

All under `src/app/admin/`. `/admin/login` has no admin chrome (standalone
screen). Everything else is under the `(dashboard)` route group, sharing one
layout that calls `requireAdmin()`.

```
/admin/login                       Login form (redirects to /admin if already authed)
/admin                             Dashboard: post/job counts, recent items, quick actions
/admin/posts                       List + search/filter (status, type, category)/pagination
/admin/posts/new                   Create post (full CMS form)
/admin/posts/[id]/edit             Edit post
/admin/posts/[id]/preview          Admin-only preview, any status, noindex
/admin/jobs                        List + search/filter (status, type, company, location)
/admin/jobs/new                    Create job (full CMS form)
/admin/jobs/[id]/edit              Edit job
/admin/jobs/[id]/preview           Admin-only preview, any status, noindex
/admin/categories                  Read-only list (name, slug, post usage count)
/admin/tags                        Read-only list (name, slug, post usage count)
/admin/media                       Static empty state only — no data, no upload
```

Category/Tag/Media pages have **no create/edit/delete UI** — read-only by
design, deferred to a later phase.

## 8. Completed Phases (1–8)

1. **Project init** — Next.js/TS/Tailwind scaffold, base layout, Header/Footer.
2. **MongoDB + Mongoose** — connection module, all 6 models, seed script.
3. **Services + validation** — service layer (CRUD + typed queries) and Zod
   validation for Post/Job/Category/Tag, shared error types.
4. **Public website UI** — homepage, all listing pages, static trust pages,
   design system (`src/lib/styles.ts`).
5. **Public content/job detail pages** — `[slug]` routes, `ContentRenderer`,
   related-content sections, `ApplyButton`.
6. **Admin authentication** — session/login/logout, `proxy.ts` route
   protection, rate limiting.
7. **Admin dashboard foundation** — `AdminNav`, dashboard stats/recent
   content, read-only Categories/Tags/Media pages, `/admin/posts` and
   `/admin/jobs` list scaffolding.
8. **Post CMS** — full create/edit/publish/archive/delete/preview for posts;
   `MarkdownEditor`, slug auto-generation, category/tag selection.
9. **Job CMS** — full create/edit/publish/archive/delete/preview for jobs;
   application/source URL handling, deadline clearing, hardened `urlSchema`
   (protocol whitelist) shared back into Post's canonical URL validation.

(Numbering above is sequential build order; the phase prompts labelled the
last two "Phase 7" and "Phase 8".)

## 9. Important Implementation Decisions

- No separate `publishPost`/`archivePost`/etc. service functions — the
  existing `updatePost`/`updateJob` already handle status transitions
  correctly (`publishedAt` is only set on the *first* transition into
  PUBLISHED), so CMS Server Actions just call `update*` with an explicit
  status derived from which submit button was clicked.
- `DeletePostForm`/`DeleteJobForm` are separate near-duplicate components
  (not a shared generic one) — deliberate, to avoid touching Phase 7's
  verified code while building Phase 8.
- Job's `source` field is plain text (e.g. "Company careers page"), not a
  URL — matches the actual schema; don't add URL validation to it.
- No `<select>` dropdown for post/job "author" — always the authenticated
  admin's id, set server-side only, never a client-editable field
  (`updatePostInputSchema` omits `author` entirely, so it can never change).
- Featured image fields exist on both models but have **no picker in either
  CMS form** — shown as a "coming later" placeholder, since Media has no
  upload path yet and would always be an empty list.
- Changing a published post/job's slug is allowed but **breaks existing
  links** — no redirect system exists; the edit form shows an inline warning
  when editing a published item.

## 10. Security Decisions

- `urlSchema` enforces http(s)-only (rejects `javascript:`/`data:`/`file:`/
  `vbscript:`) — applies to `Job.applicationUrl` and all `seo.canonicalUrl`
  fields. Verified live: a `javascript:` applicationUrl is rejected
  server-side with a clean message, not silently stored.
- `passwordHash` has `select: false` in the schema — excluded from every
  default query; only `authenticateAdmin()` explicitly selects it.
- `AUTH_SECRET` and `MONGODB_URI` are read directly via `process.env` inside
  server-only modules, never re-exported through `src/lib/env.ts` (which
  only holds `NEXT_PUBLIC_*` values and is imported by client components).
- All admin mutations require `requireAdmin()` inside the Server Action
  itself, not just route-level protection — defense in depth against a
  proxy matcher misconfiguration.
- Draft/archived content is invisible through every public path (listings,
  detail pages, search) — enforced by the service layer's status filters,
  not by UI hiding.

## 11. Known Limitations

- Rate limiting is weak in practice (see §5) — not production-grade.
- No media upload/storage integration (Cloudinary/S3/R2) — explicitly
  deferred; Media model exists but is unused.
- No Category/Tag create/edit/delete UI.
- No SEO infrastructure: no sitemap.xml, robots.txt, JSON-LD/structured
  data, or dynamic per-page `<title>`/meta generation from content — all
  explicitly deferred to a future SEO phase per every prior phase's
  instructions.
- `/search` is a simple in-memory substring match over a bounded recent-item
  fetch, not real full-text/indexed search.
- No slug-change redirect system.
- Single admin only; no roles beyond ADMIN, no invite/registration flow.
- No automated test suite (verification has been manual/live-browser via a
  temporary MongoDB per phase, not committed to the repo).
- A stray phase-8 temp verification script (`scripts/_start-test-db.ts`,
  contains a hardcoded test password) was accidentally captured in commit
  `6b61d14` and has been deleted from the working tree but **the deletion is
  not yet committed** — see §14.

## 12. Production/Deployment Status

**Not deployed.** No `vercel.json` or other deployment config exists in the
repo. Vercel is the intended target per SRS.md but no deployment has been
performed. Development/verification so far has used a temporary local
MongoDB (`mongodb-memory-server`, installed and removed per phase) — the app
has never been run against a real MongoDB Atlas cluster.

## 13. Environment Variables

Names only — see `.env.example` for the authoritative template.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_NAME` | Public site name (client-safe) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (client-safe) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown on /contact (client-safe) |
| `MONGODB_URI` | MongoDB Atlas connection string — server-only |
| `AUTH_SECRET` | Session-signing secret — server-only, required at runtime, not at build time |
| `SEED_ADMIN_NAME` | Used only by `npm run seed` |
| `SEED_ADMIN_EMAIL` | Used only by `npm run seed` |
| `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` |

## 14. Git Checkpoint

- Branch: `main`, up to date with `origin/main`
  (`git@github-cmd:nikhilcheemala18-cmd/devcareer-hub.git`)
- HEAD: `6b61d14` — "feat: add job content management CMS" (Job CMS / Phase 8)
- Prior commits: `dfdd7b3` (admin dashboard, Phase 7), `e5993aa` (data layer
  through public site + auth, Phases 1–6), `e7e3f36`/`1e2805b` (scaffold)
- **Working tree is not clean**: `scripts/_start-test-db.ts` shows as a
  pending deletion (it was accidentally committed as part of `6b61d14`; it's
  a temp verification script with a hardcoded test password and should not
  be in the repo). Commit this deletion before continuing.

## 15. Next Planned Phase

Not yet specified by the user. Natural next candidates given SRS.md's phase
list and current gaps: Category/Tag CRUD UI, Media upload (storage
provider), or the SEO phase (sitemap, robots.txt, structured data, dynamic
metadata) — do not assume which one; confirm with the user before starting.
