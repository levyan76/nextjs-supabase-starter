# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-06-06

Initial public release.

### Stack

- Next.js 16 (App Router, Server Actions, standalone output)
- React 19.2
- Tailwind 4 + shadcn/ui (32 UI components)
- Supabase (auth + Postgres + RLS via JWT `app_metadata`)
- next-intl (FR/EN routing under `/[locale]/...`)
- TanStack Query, react-hook-form + zod 4, @react-pdf/renderer, Konva, recharts
- Vitest + Playwright, ESLint 9, Prettier 3
- Husky + lint-staged pre-commit
- GitHub Actions CI (lint + typecheck + test + build + Playwright E2E)
- Dependabot weekly grouped updates
- Multi-stage Docker (node 22-alpine, standalone)

### Features

- Email + Azure SSO auth + OAuth callback
- First-admin `/setup` flow (idempotent, blocked after first run)
- Full user CRUD: create, edit, soft delete (`deleted_at`), reset password
- Admin + client dashboards, profile page, admin settings
- Sidebar + header with locale switcher, user menu, dark mode
- Rate limiting middleware (in-memory or Upstash Redis) with RFC-compliant headers
- Structured logger (JSON in prod, colored in dev)
- Feature flags backed by Postgres + React hook
- CSP env-aware (strict in prod, dev-friendly in dev)
- Security headers: HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- Custom 404 / 500 pages
- 67 unit tests (Vitest) + 2 E2E specs (Playwright)
- Scaffold scripts: `new-app.ps1` (Windows) + `new-app.sh` (Linux/macOS)
