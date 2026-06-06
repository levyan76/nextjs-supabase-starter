<div align="center">

# nextjs-supabase-starter

**Starter Next.js 16 + Supabase de qualité production** — auth, RLS, i18n, rate limiting, feature flags, tests, CI, Docker. Prêt à déployer.

[![CI](https://github.com/levyan76/nextjs-supabase-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/levyan76/nextjs-supabase-starter/actions/workflows/ci.yml)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.99-3ecf8e?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com)

[English](./README.md) · [Français](./README.fr.md)

</div>

---

## Pourquoi ce starter

La plupart des boilerplates « Next.js + Supabase » donnent l'auth et s'arrêtent là. Celui-ci inclut toute la plomberie ennuyeuse mais critique qu'une vraie app a besoin — pour que tu te concentres sur ce qui rend la tienne unique.

| Inclus dès le jour 1            | Sans avoir à l'écrire                                      |
| ------------------------------- | ---------------------------------------------------------- |
| 🔐 Auth (email + SSO Microsoft) | + callback OAuth, magic links loggés en dev                |
| 👮 Contrôle d'accès par rôle    | RLS + JWT `app_metadata`, non falsifiable côté client      |
| 🌍 Routing i18n (FR/EN)         | `next-intl`, sélecteur de langue, clés génériques incluses |
| 🚦 Rate limiting                | Sliding window, fallback mémoire, prêt pour Upstash        |
| 📊 Logs structurés              | JSON en prod, coloré en dev, événements nommés             |
| 🚩 Feature flags                | En DB, hook React, pas besoin de redéploiement             |
| 🧪 67 tests unit + E2E          | Vitest + Playwright, tous verts                            |
| 🛡️ Headers sécurité             | CSP env-aware, HSTS, X-Frame-Options, Permissions-Policy   |
| 🤖 CI/CD                        | GitHub Actions : lint + typecheck + test + build + E2E     |
| 📦 Docker                       | Multi-stage, user non-root, output standalone              |
| 🧹 Hooks pre-commit             | Husky + lint-staged (eslint --fix + prettier)              |
| 📈 Dependabot                   | Bumps hebdo groupés, ignore majors Next/React              |

---

## Démarrage rapide

```bash
# 1. Clone
git clone https://github.com/levyan76/nextjs-supabase-starter.git mon-app
cd mon-app
rm -rf .git && git init -b main

# 2. Configurer
cp .env.local.example .env.local
# Éditer .env.local — au minimum : NEXT_PUBLIC_APP_NAME, Supabase URL + clés

# 3. Installer
npm install

# 4. Démarrer Supabase en local (Docker requis)
npx supabase start
npx supabase db reset    # applique migrations + seed

# 5. Lancer
npm run dev              # → http://localhost:3000

# 6. Créer le premier admin
# Aller à http://localhost:3000/setup
```

### Ou utiliser le script de scaffold

```powershell
# Windows
.\scripts\new-app.ps1 -AppName "mon-app" -Port 3001
```

```bash
# Linux / macOS
./scripts/new-app.sh mon-app 3001
```

Le script copie le template dans un dossier frère, renomme `package.json`, configure le port, remplit `.env.local`, et fait un git init propre.

---

## Architecture

```
app/                          # Next.js App Router
├── [locale]/
│   ├── (auth)/               # login, callback, setup
│   └── (dashboard)/          # admin/, client/, profile/, settings/
└── api/setup/route.ts        # endpoint création 1er admin

components/
├── dashboard/                # layout, header, sidebar
└── ui/                       # 32 composants shadcn/ui

lib/
├── auth/roles.ts             # ROLES, PERMISSIONS, isAdmin, canAccess
├── server/
│   ├── auth.ts               # requireUser, requireAdminRole
│   ├── action-response.ts    # ActionResponse<T>, withActionResponse
│   ├── rate-limit.ts         # Sliding window (mémoire ou Upstash)
│   ├── logger.ts             # Logs JSON / coloré dev
│   └── feature-flags.ts      # isEnabled(key)
├── supabase/{client,server,types}.ts
├── i18n/{routing,request}.ts
├── pdf/                      # base de document @react-pdf/renderer
└── validations/              # schémas zod

middleware.ts                 # Rate limit → i18n → auth → garde admin

supabase/
├── migrations/               # 5 migrations (profiles, audit, flags, JWT refresh)
└── seed.sql                  # Users dev + flags

tests/
├── unit/                     # 67 tests Vitest
└── e2e/                      # Playwright (auth + home)
```

---

## Stack

| Couche        | Choix                                              |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Actions)            |
| Runtime       | React 19.2                                         |
| Styles        | Tailwind 4 + shadcn/ui + `tw-animate-css`          |
| Primitives UI | Radix UI (paquets `@radix-ui/react-*` individuels) |
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

## Sécurité

| Contrôle                                                   | Statut             |
| ---------------------------------------------------------- | ------------------ |
| RLS sur toutes les tables                                  | ✅                 |
| JWT `role` synchronisé côté serveur via trigger Postgres   | ✅ non falsifiable |
| `.env.local` dans `.gitignore`                             | ✅                 |
| Service-role key côté serveur uniquement                   | ✅                 |
| CSP env-aware                                              | ✅ stricte en prod |
| HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy | ✅                 |
| Rate limiting par IP + par route                           | ✅                 |
| Protection open redirect (`?redirect=`)                    | ✅                 |
| Password policy (min 8, maj, chiffre, spécial)             | ✅                 |
| `/setup` idempotent (bloqué après 1er admin)               | ✅                 |

Si tu trouves une faille, contacte [levyan76@gmail.com](mailto:levyan76@gmail.com) — n'ouvre pas d'issue publique.

---

## Scripts

```bash
npm run dev              # serveur dev sur le port 3000
npm run build            # build production
npm run typecheck        # tsc --noEmit
npm run lint             # eslint .
npm run format           # prettier --write

npm test                 # Vitest (one-shot)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # rapport couverture HTML

npm run test:e2e         # Playwright (headless)
npm run test:e2e:ui      # Playwright UI mode

npm run generate:schema  # régen types Supabase
npm run supabase:reset   # réapplique migrations + seed
```

---

## Personnaliser pour ton app

1. **Branding** → `.env.local` : `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_LOGO_PATH`, `NEXT_PUBLIC_BRAND_PRIMARY`
2. **Tables métier** → nouvelle migration `supabase/migrations/000XX_<feature>.sql`
3. **Navigation** → ajouter des items dans `components/dashboard/sidebar/sidebar.tsx`
4. **Pages** → nouvelles routes dans `app/[locale]/(dashboard)/`
5. **Server actions** → utiliser le pattern `withActionResponse()` de `lib/server/action-response.ts`
6. **Feature flags** → `INSERT INTO feature_flags (key, enabled, description) VALUES (...)`
7. **i18n** → ajouter les clés dans `messages/fr.json` et `messages/en.json`
8. **Rôles** → étendre `PERMISSIONS` dans `lib/auth/roles.ts`

---

## Contribuer

Voir [CONTRIBUTING.fr.md](./CONTRIBUTING.fr.md) — workflow court + standards.

## Licence

MIT © Yan Levasseur. Voir [LICENSE](./LICENSE).
