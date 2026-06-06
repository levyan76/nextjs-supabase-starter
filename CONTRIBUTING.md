# Contributing

[English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md)

Thanks for caring about the foundation that other apps will be built on. Improvements here have a multiplier effect.

---

## When to contribute

| Type                    | Example                                           | Action                |
| ----------------------- | ------------------------------------------------- | --------------------- |
| 🐛 Critical bug         | Security, broken auth, data loss                  | Open a PR immediately |
| 🐛 Minor bug            | ESLint warning, typo, UI quirk                    | Batch into a PR       |
| ✨ Reusable pattern     | Hook, helper, component useful in 2+ derived apps | PR with justification |
| 📚 Docs                 | README, JSDoc, examples                           | PRs welcome           |
| 🔧 Tooling              | CI, linting, scripts                              | PRs welcome           |
| 🚫 App-specific feature | Belongs in your own app fork                      | **Don't add it here** |

**Rule of thumb**: if a feature isn't useful to at least two apps built from this starter, it doesn't belong in the starter.

---

## Workflow

```bash
git checkout -b chore/<topic>   # or feat/, fix/, docs/
# changes...
npm run typecheck && npm run lint && npm test && npm run build
git commit -m "<type>(<scope>): <what>"
git push -u origin chore/<topic>
gh pr create
```

The pre-commit hook runs `eslint --fix` and `prettier --write` automatically via `lint-staged`.

---

## Code standards

- **Strict types** — no `any`. If you absolutely must, use `as unknown as <Type>`.
- **No "what the code does" comments** — well-named identifiers are enough. Only comment the **why** when non-obvious (a hidden constraint, an invariant, a workaround).
- **Tests for everything in `lib/server/*`** — that's the code shared by every derived app.
- **No feature flags for template changes** — it's permanent: either we adopt it or we don't.
- **Commit convention**: `<type>(<scope>): <description>` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

---

## PR checklist

- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors (warnings are non-blocking but minimize)
- [ ] `npm test` — all tests green
- [ ] `npm run build` — succeeds and shows `ƒ Proxy (Middleware)` in the output
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] If touching `middleware.ts`, `lib/server/auth.ts`, `lib/server/rate-limit.ts`, or a migration: unit tests added or updated
- [ ] If adding a dependency: justified in the PR body (why this lib, why not an existing alternative)
- [ ] No secrets in the diff (API keys, passwords, internal URLs)

---

## Security

If you find a security vulnerability (auth bypass, RLS bypass, leaked secret, etc.), **do NOT open a public issue**. Email [levyan76@gmail.com](mailto:levyan76@gmail.com) directly with a description and a PoC if you have one.

---

## Locked-in technical choices

These decisions structure the starter. Changing them requires explicit discussion.

- **Framework** — Next.js App Router (not Pages Router, not Remix, not SvelteKit)
- **Auth + DB** — Supabase (not Auth0, not Clerk, not Prisma+JWT custom)
- **Styles** — Tailwind + shadcn/ui (not Chakra, not Material UI)
- **i18n** — next-intl (not react-intl, not i18next)
- **Forms** — react-hook-form + zod
- **Tests** — Vitest + Playwright (not Jest, not Cypress)
- **CI** — GitHub Actions
