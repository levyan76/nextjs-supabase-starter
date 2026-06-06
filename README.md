<div align="center">

# nextjs-supabase-starter

**Production-grade Next.js 16 + Supabase starter** — auth, RLS, i18n, rate limiting, feature flags, tests, CI, Docker. Ready to ship.

[![CI](https://github.com/levyan76/nextjs-supabase-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/levyan76/nextjs-supabase-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.99-3ecf8e?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com)

[English](./README.md) · [Français](./README.fr.md)

</div>

---

## Why this starter

Most "Next.js + Supabase" boilerplates give you auth and stop there. This one ships with the boring-but-critical plumbing every real app needs — so you can focus on what makes yours different.

| You get on day 1                | Without writing it yourself                              |
| ------------------------------- | -------------------------------------------------------- |
| 🔐 Auth (email + Microsoft SSO) | + OAuth callback, magic link logging in dev              |
| 👮 Role-based access            | RLS + JWT `app_metadata`, non-spoofable client-side      |
| 🌍 i18n routing (FR/EN)         | `next-intl`, locale switcher, all generic keys included  |
| 🚦 Rate limiting                | Sliding window, in-memory fallback, Upstash-ready        |
| 📊 Structured logging           | JSON in prod, colored in dev, named events               |
| 🚩 Feature flags                | DB-backed, React hook, no redeploy needed                |
| 🧪 67 unit tests + E2E          | Vitest + Playwright, all green                           |
| 🛡️ Security headers             | CSP env-aware, HSTS, X-Frame-Options, Permissions-Policy |
| 🤖 CI/CD                        | GitHub Actions: lint + typecheck + test + build + E2E    |
| 📦 Docker                       | Multi-stage, non-root user, standalone output            |
| 🧹 Pre-commit hooks             | Husky + lint-staged (eslint --fix + prettier)            |
| 📈 Dependabot                   | Weekly grouped bumps, ignore Next/React majors           |

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/levyan76/nextjs-supabase-starter.git my-app
cd my-app
rm -rf .git && git init -b main

# 2. Configure
cp .env.local.example .env.local
# Edit .env.local — at minimum: NEXT_PUBLIC_APP_NAME, Supabase URL + keys

# 3. Install
npm install

# 4. Start Supabase locally (requires Docker)
npx supabase start
npx supabase db reset    # applies migrations + seed

# 5. Run
npm run dev              # → http://localhost:3000

# 6. Set up the first admin
# Visit http://localhost:3000/setup
```

### Or use the scaffold script

```powershell
# Windows
.\scripts\new-app.ps1 -AppName "my-app" -Port 3001
```

```bash
# Linux / macOS
./scripts/new-app.sh my-app 3001
```

The script copies the template into a sibling folder, renames `package.json`, configures the port, fills `.env.local`, and creates a clean git init.

---

## Architecture

```
app/                          # Next.js App Router
├── [locale]/
│   ├── (auth)/               # login, callback, setup
│   └── (dashboard)/          # admin/, client/, profile/, settings/
└── api/setup/route.ts        # First-admin creation endpoint

components/
├── dashboard/                # layout, header, sidebar
└── ui/                       # 32 shadcn/ui components

lib/
├── auth/roles.ts             # ROLES, PERMISSIONS, isAdmin, canAccess
├── server/
│   ├── auth.ts               # requireUser, requireAdminRole
│   ├── action-response.ts    # ActionResponse<T>, withActionResponse
│   ├── rate-limit.ts         # Sliding window (memory or Upstash)
│   ├── logger.ts             # Structured JSON / colored dev logs
│   └── feature-flags.ts      # isEnabled(key)
├── supabase/{client,server,types}.ts
├── i18n/{routing,request}.ts
├── pdf/                      # @react-pdf/renderer document base
└── validations/              # zod schemas

middleware.ts                 # Rate limit → i18n → auth → admin guard

supabase/
├── migrations/               # 5 migrations (profiles, audit, flags, JWT refresh)
└── seed.sql                  # Dev users + flags

tests/
├── unit/                     # 67 Vitest tests
└── e2e/                      # Playwright (auth + home)
```

---

## Stack

| Layer         | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Actions)            |
| Runtime       | React 19.2                                         |
| Styles        | Tailwind 4 + shadcn/ui + `tw-animate-css`          |
| UI primitives | Radix UI (individual `@radix-ui/react-*` packages) |
| Auth + DB     | Supabase (`@supabase/ssr` + `supabase-js`)         |
| i18n          | next-intl 4 (FR/EN)                                |
| Forms         | react-hook-form 7 + zod 4                          |
| Data          | TanStack Query 5                                   |
| PDF           | @react-pdf/renderer 4                              |
| Charts        | recharts 3                                         |
| Drag & drop   | @dnd-kit                                           |
| Canvas        | Konva 10                                           |
| CSV           | papaparse + json2csv                               |
| Tests         | Vitest 4 + Playwright 1.60                         |
| Lint / Format | ESLint 9 + Prettier 3                              |
| Container     | Docker multi-stage (node 22-alpine)                |

---

## Security

| Control                                                    | Status            |
| ---------------------------------------------------------- | ----------------- |
| RLS on all tables                                          | ✅                |
| JWT `role` synced server-side via Postgres trigger         | ✅ non-spoofable  |
| `.env.local` git-ignored                                   | ✅                |
| Service-role key server-only                               | ✅                |
| CSP env-aware                                              | ✅ strict in prod |
| HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy | ✅                |
| Rate limiting per IP + per route                           | ✅                |
| Open redirect prevention (`?redirect=`)                    | ✅                |
| Password policy (min 8, upper, digit, special)             | ✅                |
| `/setup` idempotent (blocked after first admin)            | ✅                |

If you find a vulnerability, please email [levyan76@gmail.com](mailto:levyan76@gmail.com) — don't open a public issue.

---

## Scripts

```bash
npm run dev              # dev server on port 3000
npm run build            # production build
npm run typecheck        # tsc --noEmit
npm run lint             # eslint .
npm run format           # prettier --write

npm test                 # Vitest (one-shot)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # HTML coverage report

npm run test:e2e         # Playwright (headless)
npm run test:e2e:ui      # Playwright UI mode

npm run generate:schema  # regen Supabase types
npm run supabase:reset   # reapply migrations + seed
```

---

## Customizing for your app

1. **Brand** → `.env.local`: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_LOGO_PATH`, `NEXT_PUBLIC_BRAND_PRIMARY`
2. **Domain tables** → new migration `supabase/migrations/000XX_<feature>.sql`
3. **Navigation** → add items in `components/dashboard/sidebar/sidebar.tsx`
4. **Pages** → new routes under `app/[locale]/(dashboard)/`
5. **Server actions** → use the `withActionResponse()` pattern from `lib/server/action-response.ts`
6. **Feature flags** → `INSERT INTO feature_flags (key, enabled, description) VALUES (...)`
7. **i18n** → add keys to `messages/en.json` and `messages/fr.json`
8. **Roles** → extend `PERMISSIONS` in `lib/auth/roles.ts`

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — short workflow + standards.

## License

MIT © Yan Levasseur. See [LICENSE](./LICENSE).
