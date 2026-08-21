# Developer Jobs & Knowledge Publishing Platform

A content publishing platform for software engineering jobs, interview preparation, system design, and developer knowledge. See [SRS.md](./SRS.md) for the full product specification.

**Current phase:** Phase 7 — Post Content Management / CMS. The admin can fully create, edit, publish, archive, and delete posts (all 5 types) at `/admin/posts`, with a Markdown editor + live preview, search/filter, category/tag selection, and SEO fields. Job/category/tag CRUD and media upload are not implemented yet — those are later phases.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- MongoDB Atlas + [Mongoose](https://mongoosejs.com)
- Deployed on [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18.18+ (Node 22 recommended)
- npm

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment variable template and fill in your MongoDB Atlas connection string and an `AUTH_SECRET`:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command          | Description                                          |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Start the local development server                    |
| `npm run build`  | Create a production build                              |
| `npm run start`  | Run the production build locally                       |
| `npm run lint`   | Run ESLint                                              |
| `npm run seed`   | Create the local development admin user in MongoDB     |

## Project Structure

```
src/
  app/
    admin/
      login/          /admin/login — no admin chrome, standalone screen
      (dashboard)/    /admin, /admin/posts, /jobs, /categories, /tags, /media
                       (route group; shares the protected admin layout)
    ...               Public routes: /, /jobs, /blog, /interview-prep,
                       /system-design, /search, /about, /contact,
                       /privacy-policy, /terms
  components/
    layout/           Public Header/Footer + SiteChrome (hides them on /admin/*)
    admin/             AdminNav, AdminPageHeader, AdminStatCard, StatusBadge,
                       ComingSoonAction
    content/, ui/      Shared public site components (cards, badges, etc.)
  lib/
    env.ts            Centralized public environment variable access
    auth/              Session tokens, credential verification, rate limiting
    db/
      connect.ts       Cached Mongoose connection
      enums.ts         Shared enums (post type, status, employment type, role)
      models/          Mongoose models (User, Post, Job, Category, Tag, Media)
    services/          Server-only data-access layer used by all pages
    validation/        Zod schemas for service inputs
  proxy.ts             Redirects unauthenticated /admin/* requests to /admin/login
public/                Static assets
scripts/
  seed.ts              Dev-only script that creates the admin user
```

## Database

The app connects to MongoDB Atlas via Mongoose. `MONGODB_URI` must point at a reachable cluster (a free Atlas cluster works fine for local development).

To create a local admin user, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.local`, then run:

```bash
npm run seed
```

The script is idempotent — running it again will not duplicate the admin user.

## Admin Authentication & Dashboard

`/admin/login` authenticates against the seeded admin user and sets an HTTP-only, signed session cookie; `/admin/*` redirects to it unless that session is present and valid. Set `AUTH_SECRET` in `.env.local` (see [.env.example](./.env.example) for how to generate one) — without it, login fails with a clear error rather than silently succeeding insecurely. `AUTH_SECRET` is read at runtime only, so it is not required to run `npm run build`.

Once signed in, `/admin` shows post/job counts by status, recent posts/jobs (including drafts and archived — admin-only), and links to `/admin/posts`, `/admin/jobs`, `/admin/categories`, `/admin/tags`, and `/admin/media`. Those list existing content but don't yet support creating or editing it.

There is no registration, password reset, or admin-management UI yet — the only way to create an admin user is `npm run seed`.

## Environment Variables

See [.env.example](./.env.example) for the current list of environment variables. `MONGODB_URI`, `AUTH_SECRET`, and the `SEED_ADMIN_*` values are secrets/local-only and must never be committed — `.env.local` is already gitignored.
