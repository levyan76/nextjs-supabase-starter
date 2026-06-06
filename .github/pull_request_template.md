## What

<!-- 1–2 sentences summarizing the change -->

## Why

<!-- Problem solved or value added. If bug: link the issue. -->

## How

<!-- Technical approach in bullet points. Mention pitfalls. -->

## Impact on derived apps

<!-- Check what applies -->

- [ ] None — internal change only
- [ ] Dep bump (apps don't need to do anything)
- [ ] Public API changed (apps need to adapt — detail below)
- [ ] DB migration (apps need to replay — detail below)
- [ ] New / renamed env variable (document in `.env.local.example`)

## Test plan

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build` (middleware visible in the output)
- [ ] Unit tests added if touching `lib/server/*`, `middleware.ts`, or validation
- [ ] `CHANGELOG.md` updated under `[Unreleased]`

## Screenshots / output

<!-- If UI: before/after screenshots. If CLI: console output. -->
