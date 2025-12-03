# Repository Guidelines

## Project Structure & Module Organization
- App Router lives in `src/app` (routes, layouts, metadata); shared UI in `src/components`; cross-cutting helpers in `src/lib`; types in `src/types`; unit tests in `src/tests`.
- E2E tests use Playwright in `e2e/tests` with page objects in `e2e/pages`.
- Docs and specs sit under `docs/` and `specs/`; public assets live in `public/`.
- Path alias `@/*` maps to `src/*`; prefer absolute imports.

## Build, Test, and Development Commands
- `npm run dev` – start Next.js dev server at :3000.
- `npm run build` / `npm start` – production build and serve.
- `npm run lint` – ESLint (Next + TypeScript rules); `npm run typecheck` – `tsc --noEmit`.
- `npm test` – Jest unit tests; `npm run test:ci` adds coverage; `npm run test:e2e` (or `:ui`, `:debug`, `:report`) for Playwright.
- `npm run format` / `npm run format:check` – Prettier with Tailwind plugin (no manual formatting).

## Coding Style & Naming Conventions
- TypeScript strict mode; no `any` unless justified. Keep components small and server/client semantics explicit (`'use client'` when required).
- Prettier enforces 2-space indent and quote/style defaults.
- Naming: PascalCase components/types, camelCase variables/functions, kebab-case files/routes. Favor descriptive prop names (`raceId`, `oddsIntervalMs`).
- Prefer functional components with typed props and narrow exports; reuse primitives before adding new atoms.

## Testing Guidelines
- Unit tests: colocate in `__tests__` or `*.test.ts(x)` near code or under `src/tests`. Testing Library matchers are preloaded in `jest.setup.ts`.
- Coverage target: ≥80% for core logic; add regression tests for bug fixes. Mock network calls; use fake timers to stabilize time-sensitive logic.
- E2E: keep selectors data-driven (`data-testid`), reuse page objects in `e2e/pages`, and scope to critical flows (race listing, details, odds refresh).

## Commit & Pull Request Guidelines
- Commit format: `<type>(<scope>): <subject>` (e.g., `feat(app): add race odds refresh`). Scopes: `app`, `components`, `lib`, `api`, `tests`, `config`.
- Branches: `feature/<issue>-<slug>` or `fix/<issue>-<slug>`.
- Before a PR: sync with `main`, run `npm run lint`, `npm run typecheck`, `npm test`, and run E2E when UI changes. Attach screenshots/GIFs for visible changes and link issues.
- PR description should list changes, risks, and test evidence; keep diffs small.

## Security & Configuration Tips
- Never commit secrets; use `.env.local` (see `ENVIRONMENT.md`). Keep public vars prefixed with `NEXT_PUBLIC_`.
- API keys are required for real data; stub or mock in tests. Review `next.config.js` and `postcss.config.js` before adding new tooling.
