# Contribuer

[English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md)

Merci de prendre soin de la base sur laquelle d'autres apps seront construites. Toute amélioration ici a un effet multiplicateur.

---

## Quand contribuer ?

| Type                    | Exemple                                             | Action                                       |
| ----------------------- | --------------------------------------------------- | -------------------------------------------- |
| 🐛 Bug critique         | Sécurité, auth cassée, perte de données             | PR immédiate                                 |
| 🐛 Bug mineur           | Warning ESLint, typo, UI subtile                    | PR groupée                                   |
| ✨ Pattern réutilisable | Hook, helper, composant utile dans 2+ apps dérivées | PR avec justification                        |
| 📚 Doc                  | README, JSDoc, exemples                             | PR bienvenue                                 |
| 🔧 Tooling              | CI, linting, scripts                                | PR bienvenue                                 |
| 🚫 Feature métier       | Spécifique à une app                                | **Ne PAS l'ajouter ici** — garder dans l'app |

**Règle d'or** : si une feature n'est pas utile à au moins 2 apps construites sur ce starter, elle n'a rien à faire dans le starter.

---

## Workflow

```bash
git checkout -b chore/<sujet>   # ou feat/, fix/, docs/
# modifications...
npm run typecheck && npm run lint && npm test && npm run build
git commit -m "<type>(<scope>): <quoi>"
git push -u origin chore/<sujet>
gh pr create
```

Le hook pre-commit tourne `eslint --fix` et `prettier --write` automatiquement via `lint-staged`.

---

## Standards de code

- **Types stricts** — pas de `any`. Si vraiment forcé : `as unknown as <Type>`.
- **Pas de commentaire de "ce que fait le code"** — les identifiants doivent suffire. Commenter le **pourquoi** non-évident (contrainte cachée, invariant, workaround).
- **Tests pour tout `lib/server/*`** — c'est le code partagé par toutes les apps dérivées.
- **Pas de feature flag pour un changement de template** : c'est permanent, soit on adopte soit on n'adopte pas.
- **Convention de commit** : `<type>(<scope>): <description>` — types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

---

## Checklist PR

- [ ] `npm run typecheck` — 0 erreur
- [ ] `npm run lint` — 0 erreur (warnings non bloquants mais à minimiser)
- [ ] `npm test` — tous les tests verts
- [ ] `npm run build` — succès, le middleware apparaît dans l'output (`ƒ Proxy (Middleware)`)
- [ ] `CHANGELOG.md` mis à jour dans `[Unreleased]`
- [ ] Si la PR touche `middleware.ts`, `lib/server/auth.ts`, `lib/server/rate-limit.ts` ou une migration : tests unitaires ajoutés
- [ ] Si la PR ajoute une dépendance : justifier dans le body de la PR
- [ ] Pas de secret dans le diff (clés API, mots de passe, URLs internes)

---

## Sécurité

Si tu trouves une faille (auth bypass, RLS contournable, secret committé, etc.), **n'ouvre PAS d'issue publique**. Contacte [levyan76@gmail.com](mailto:levyan76@gmail.com) directement avec la description et un PoC si possible.

---

## Choix techniques verrouillés

Ces décisions structurent le starter. Les changer demande une discussion explicite.

- **Framework** — Next.js App Router (pas Pages Router, pas Remix, pas SvelteKit)
- **Auth + DB** — Supabase (pas Auth0, pas Clerk, pas Prisma+JWT custom)
- **Styles** — Tailwind + shadcn/ui (pas Chakra, pas Material UI)
- **i18n** — next-intl (pas react-intl, pas i18next)
- **Forms** — react-hook-form + zod
- **Tests** — Vitest + Playwright (pas Jest, pas Cypress)
- **CI** — GitHub Actions
