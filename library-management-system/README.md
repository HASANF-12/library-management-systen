# Mini Library Management System – v1

A production-quality (free-tier friendly) Next.js web app for library management with books, loans, roles, and optional AI features.

## Tech stack

- **Next.js 15+** (App Router) + TypeScript
- **Prisma ORM** + **Neon Postgres**
- **NextAuth.js (Auth.js)** with Google OAuth
- **Tailwind CSS** + Radix UI–style components
- **Vercel** (serverless) deployment target

## Features

- **Auth:** Google SSO; roles: Admin, Librarian, Member
- **Books:** CRUD (Admin/Librarian); view/search (all); soft delete
- **Loans:** Check-out/check-in (Admin/Librarian); “My loans” (Member)
- **Search & filters:** Title, author, ISBN, tags, availability; sort by newest or title
- **AI (optional):** Improve description, suggest tags (requires `OPENAI_API_KEY`)
- **Extras:** Activity log (audit), toasts, confirmation dialogs, analytics cards, seed script

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string (use **pooling** endpoint for serverless) |
| `NEXTAUTH_URL` | Yes | e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Random secret (e.g. `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `OPENAI_API_KEY` | No | Enables AI “Improve description” and “Suggest tags” |
| `OPENAI_MODEL` | No | Default: `gpt-4o-mini` |

### 3. Database

```bash
npm run prisma:migrate
```

(Or: `npx prisma migrate dev` — creates migration and applies it.)

### 4. Seed (optional)

```bash
npm run prisma:seed
```

Creates demo users (admin@library.local, librarian@library.local, member@library.local) and sample books. **Note:** These users have no OAuth accounts; sign in with your own Google account, then promote yourself to Admin in the database if needed:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-google@gmail.com';
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Google, then visit Dashboard, Books, Loans, etc.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:seed` | Seed database |

## Deploy to Vercel

1. Push the repo to GitHub and import the project in Vercel.
2. Add the same environment variables in Vercel (Project → Settings → Environment Variables).
3. Set `NEXTAUTH_URL` to your production URL (e.g. `https://your-app.vercel.app`).
4. Use Neon’s **pooling** connection string for `DATABASE_URL` (serverless-friendly).
5. Deploy. Vercel runs `build`; ensure `postinstall` runs `prisma generate` (already in `package.json`).
6. Run migrations once against the production DB (e.g. from your machine with `DATABASE_URL` set to production):

   ```bash
   npx prisma migrate deploy
   ```

## Project structure

- `src/app` — App Router routes
  - `(app)/` — Authenticated app (dashboard, books, loans, admin) with shared layout/nav
  - `login/` — Sign-in page
  - `api/auth/` — NextAuth handlers
  - `api/ai/` — AI routes (improve description, suggest tags)
- `src/components` — UI and feature components
- `src/lib` — Prisma client, auth, RBAC, validators, audit
- `prisma/` — Schema, migrations, seed

## Roles

- **Admin:** Users & roles, all books, all loans, activity log
- **Librarian:** Books CRUD, check-out/return, activity log
- **Member:** View/search books, “My loans” only

## License

MIT
