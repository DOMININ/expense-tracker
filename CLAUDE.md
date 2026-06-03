# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

npm workspaces monorepo. Node >=20 (`.nvmrc` pins 20). Four workspaces:

- `apps/web` — Next.js 15 (App Router) + React 19 + Tailwind 3
- `apps/api` — Nest.js 10 (Express platform)
- `packages/db` — Prisma 5 + PostgreSQL; re-exports `PrismaClient` and everything from `@prisma/client` via `src/index.ts`
- `packages/shared` — DTOs / enums / types shared between `web` and `api` (currently empty stub)

Workspace packages are consumed under the `@expence-tracker/*` scope (e.g. `import { PrismaClient } from "@expence-tracker/db"`). The same names are also wired as `paths` in `tsconfig.base.json` pointing at each package's `src/index.ts`, so editor jump-to-def lands in source rather than generated `.d.ts`.

## Common commands

Run from the repo root unless noted.

```bash
npm install                      # bootstrap all workspaces
npm run dev:web                  # Next.js dev server (apps/web)
npm run dev:api                  # Nest watch mode (apps/api), listens on PORT or 3001
npm run build:web                # next build
npm run build:api                # nest build → apps/api/dist
npm run prisma:generate          # regenerate Prisma client (run after schema edits)
npm run prisma:migrate -- --name <name>   # create + apply a dev migration
npm run prisma:studio            # Prisma Studio
```

Per-workspace (run with `-w <workspace>` from root, or `cd` into the dir):

- `npm run typecheck -w apps/web` / `-w apps/api` / `-w packages/db` / `-w packages/shared` — `tsc --noEmit`
- `npm run lint -w apps/web` — `next lint` (no lint config in `apps/api` yet)
- `npm run start:prod -w apps/api` — `node dist/main.js` after `build:api`

There is no test runner wired up in any workspace yet — don't claim tests pass without first adding one.

## Architecture notes

**TS config layering.** `tsconfig.base.json` is `strict` with `noUncheckedIndexedAccess: true` and bundler-style module resolution. `apps/api/tsconfig.json` overrides this to `commonjs` / `node` resolution and **turns off `noUncheckedIndexedAccess`** to match Nest's decorator/DI ergonomics — keep that in mind when moving code between web and api: a snippet that compiles in `api` may need extra guards in `web` or `packages/*`.

**Prisma flow.** Schema lives at `packages/db/prisma/schema.prisma`. Currently it declares only the `prisma-client-js` generator and the `postgresql` datasource (`DATABASE_URL`) — there are **no domain models yet**, so importing model types from `@expence-tracker/db` will only yield `PrismaClient` until models are added. After editing the schema, run `npm run prisma:generate` (and `prisma:migrate` for schema changes that need DB sync) before relying on new types in `apps/api` or `apps/web`.

**API surface today.** `GET /health`, `POST /auth/register`, `POST /auth/login`, CRUD `/categories` (JWT-protected). Port from `process.env.PORT ?? 3001`. CORS enabled for `process.env.FRONTEND_URL ?? "http://localhost:3000"`. JWT returned as `{ accessToken }` in response body (Bearer token, 7-day expiry).

**Web surface today.** Login (`/login`) and register (`/register`) pages with shadcn/ui forms, react-hook-form + Zod validation, JWT stored in `localStorage`. Home page at `/`. FSD architecture (see section above). Tailwind scans `./src/**/*.{ts,tsx}`.

**Env.** `.env.example` declares `DATABASE_URL` only. Copy to `.env` for local dev; Prisma reads it from the process env.

## Frontend architecture — Feature Sliced Design (FSD)

`apps/web/src` follows the [Feature Sliced Design](https://feature-sliced.design/) methodology. Layers (top to bottom, imports go downward only):

```
src/
├── app/          # Next.js App Router — routing only; thin page wrappers that import from lower layers
├── widgets/      # Composite UI blocks (not yet used)
├── features/     # User-facing capabilities (e.g. features/auth — login/register forms + API calls)
├── entities/     # Domain objects (e.g. entities/session — JWT token storage)
└── shared/       # Framework-agnostic building blocks
    ├── api/      # Base fetch client (apiPost)
    ├── config/   # Runtime config (API_URL from env)
    ├── lib/      # Utilities (cn from clsx + tailwind-merge)
    └── ui/       # shadcn/ui components (button, input, label, form, card)
```

**Import rules:** a layer may only import from layers below it. `features/*` may import from `entities/*` and `shared/*`, but NOT from other features or from `app/`. Cross-slice imports inside the same layer are forbidden — use the public `index.ts` barrel of each slice.

**shadcn/ui** components live in `shared/ui/`. The `components.json` at `apps/web/components.json` points shadcn CLI to `@/shared/ui` so new components land in the right place: `npx shadcn@latest add <component>`.

**Path alias:** `@/*` resolves to `apps/web/src/*` (configured in `apps/web/tsconfig.json`).

## Language

The README and the web app's root layout (`lang="ru"`) are in Russian. User-facing copy in `apps/web` should default to Russian unless told otherwise.

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) — `<type>(<scope>): <description>`.

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `style` | Formatting, whitespace — no logic change |
| `docs` | Documentation only (CLAUDE.md, README, comments) |
| `chore` | Build scripts, deps, config, tooling |
| `ci` | CI/CD pipeline changes |
| `test` | Adding or fixing tests |

**Scopes** (optional, match workspace/package):

- `web` — `apps/web`
- `api` — `apps/api`
- `db` — `packages/db`
- `shared` — `packages/shared`

**Rules:**

- Description in English, imperative mood, lowercase, no trailing period.
- Subject line ≤ 72 characters.
- Breaking changes: append `!` after type/scope (`feat(api)!:`) **and** add a `BREAKING CHANGE:` footer.
- Reference issues in the footer: `Closes #123`.

**Examples:**

```
feat(api): add JWT auth endpoints
fix(web): prevent double form submission on login
chore: bump prisma to 5.14
docs: add commit conventions to CLAUDE.md
feat(db)!: rename User table to Account

BREAKING CHANGE: migration required — run prisma:migrate
```

## Branching — GitHub Flow

`main` is always deployable. All work happens on short-lived feature branches merged via PR.

**Branch naming:** `<type>/<short-slug>`

| Type | When to use | Example |
|------|-------------|---------|
| `feat/` | New feature | `feat/home-screen` |
| `fix/` | Bug fix | `fix/login-redirect` |
| `chore/` | Tooling, deps, config | `chore/bump-prisma` |
| `refactor/` | Code restructure, no feature change | `refactor/auth-module` |
| `docs/` | Documentation only | `docs/api-readme` |

**Rules:**

1. Branch off `main`. Never commit directly to `main`.
2. One feature per branch — keep branches small and short-lived.
3. Push the branch and open a PR when ready for review (or as a draft for early feedback).
4. Merge via **squash-and-merge** to keep `main` history linear.
5. Delete the branch after the PR is merged.
6. Keep branch names lowercase, hyphen-separated, no slashes beyond the type prefix.
