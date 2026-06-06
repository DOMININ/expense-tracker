# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Workspace-specific guidance lives next to the code:
>
> - **Backend** — [`apps/backend/CLAUDE.md`](apps/backend/CLAUDE.md) (modules, CQRS, Prisma, env, Swagger/JSDoc).
> - **Frontend** — [`apps/frontend/CLAUDE.md`](apps/frontend/CLAUDE.md) (FSD layers, shadcn/ui, env).
>
> This root file covers the project as a whole: overview, stack, commands, branching and commits.

## Project overview

Expence Tracker — приложение для учёта личных доходов и расходов. Пользователь
регистрируется, заводит категории трат и записывает транзакции (доход/расход),
видит список операций за месяц и сводку по балансу.

Реализовано сегодня:

- **Auth** — регистрация, вход (JWT, 7 дней), `GET /auth/me`.
- **Categories** — CRUD категорий, привязанных к пользователю.
- **Transactions** — CRUD транзакций с фильтром по месяцу, пагинацией и сводкой
  (доход / расход / баланс).
- **Frontend** — страницы входа/регистрации, домашний экран с последними
  транзакциями и категориями, создание категорий и транзакций.

## Tech stack

npm workspaces monorepo. Node >=20 (`.nvmrc` pins 20). Four workspaces, consumed
under the `@expence-tracker/*` scope:

| Workspace          | Package                      | Stack                                                                   |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------- |
| `apps/frontend`    | `@expence-tracker/frontend`  | Next.js 15 (App Router) + React 19 + Tailwind 3 + shadcn/ui (FSD)        |
| `apps/backend`     | `@expence-tracker/backend`   | Nest.js 10 (Express) + `@nestjs/cqrs` + Passport-JWT                     |
| `packages/db`      | `@expence-tracker/db`        | Prisma 5 + PostgreSQL; re-exports `PrismaClient` and `@prisma/client`    |
| `packages/shared`  | `@expence-tracker/shared`    | DTOs / enums / constants shared between frontend and backend (class-validator) |

The `@expence-tracker/*` names are also wired as `paths` in `tsconfig.base.json`
pointing at each package's `src/index.ts`, so editor jump-to-def lands in source
rather than generated `.d.ts`.

**TS config.** `tsconfig.base.json` is `strict` with `noUncheckedIndexedAccess: true`.
`apps/backend` turns that flag off (and uses `commonjs`/`node` resolution) for Nest's
DI ergonomics — so code moved from backend to frontend or `packages/*` may need extra
index guards. Each app's CLAUDE.md notes its own override.

## Common commands

Run from the repo root. Per-workspace specifics (lint, prod start, etc.) live in
each app's CLAUDE.md.

```bash
npm install                      # bootstrap all workspaces
docker compose up -d             # local PostgreSQL on :5432

npm run dev:frontend             # Next.js dev server (apps/frontend, :3000)
npm run dev:backend              # Nest watch mode (apps/backend, PORT or :3001)
npm run build:frontend           # next build
npm run build:backend            # nest build → apps/backend/dist

npm run prisma:generate          # regenerate Prisma client (run after schema edits)
npm run prisma:migrate -- --name <name>   # create + apply a dev migration
npm run prisma:studio            # Prisma Studio

npm run typecheck -w <workspace> # tsc --noEmit in any workspace
```

There is no test runner wired up in any workspace yet — don't claim tests pass
without first adding one.

## Environment

Root `.env` (read by Prisma and the backend) declares `DATABASE_URL` and
`JWT_SECRET`. Per-app `.env.example` files document the rest — copy them before
local dev. See each workspace's CLAUDE.md for the full variable list.

## Language

User-facing copy defaults to **Russian** (frontend specifics in
[`apps/frontend/CLAUDE.md`](apps/frontend/CLAUDE.md)). Code, identifiers, commit
messages and PR descriptions stay in English.

## Branching — GitHub Flow

`main` is always deployable. All work happens on short-lived feature branches
merged via PR.

**Branch naming:** `<type>/<short-slug>`

| Type        | When to use                         | Example                |
| ----------- | ----------------------------------- | ---------------------- |
| `feat/`     | New feature                         | `feat/home-screen`     |
| `fix/`      | Bug fix                             | `fix/login-redirect`   |
| `chore/`    | Tooling, deps, config               | `chore/bump-prisma`    |
| `refactor/` | Code restructure, no feature change | `refactor/auth-module` |
| `docs/`     | Documentation only                  | `docs/api-readme`      |

**Rules:**

1. Branch off `main`. Never commit directly to `main`.
2. One feature per branch — keep branches small and short-lived.
3. Push the branch and open a PR when ready for review (or as a draft for early feedback).
4. Merge via **squash-and-merge** to keep `main` history linear.
5. Delete the branch after the PR is merged.
6. Keep branch names lowercase, hyphen-separated, no slashes beyond the type prefix.

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) — `<type>(<scope>): <description>`.

**Types:**

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New user-facing feature                          |
| `fix`      | Bug fix                                          |
| `refactor` | Code change that is neither a fix nor a feature  |
| `style`    | Formatting, whitespace — no logic change         |
| `docs`     | Documentation only (CLAUDE.md, README, comments) |
| `chore`    | Build scripts, deps, config, tooling             |
| `ci`       | CI/CD pipeline changes                           |
| `test`     | Adding or fixing tests                           |

**Scopes** (optional, match workspace/package):

- `frontend` — `apps/frontend`
- `backend` — `apps/backend`
- `db` — `packages/db`
- `shared` — `packages/shared`

**Rules:**

- Description in English, imperative mood, lowercase, no trailing period.
- Subject line ≤ 72 characters.
- Breaking changes: append `!` after type/scope (`feat(backend)!:`) **and** add a `BREAKING CHANGE:` footer.
- Reference issues in the footer: `Closes #123`.

**Examples:**

```
feat(backend): add JWT auth endpoints
fix(frontend): prevent double form submission on login
chore: bump prisma to 5.14
docs: add commit conventions to CLAUDE.md
feat(db)!: rename User table to Account

BREAKING CHANGE: migration required — run prisma:migrate
```

## Pull Requests

Open PRs against `main` with the `gh` CLI (`gh pr create`).

**Title:** follow [Conventional Commits](https://www.conventionalcommits.org/) — same
`<type>(<scope>): <description>` format as commit subjects (English, imperative,
lowercase, ≤ 72 chars). For a squash-merged single-feature branch the title usually
mirrors the lead commit.

**Description** — before writing it, run `git diff main...HEAD` to ground the summary
in the actual changes. Structure the body in Markdown:

- **Summary** — 1–3 sentences on what the PR delivers and why.
- **Changes** — bullet list grouped by area (`backend`, `frontend`, `db`, `shared`).
- **Endpoints** — when the API surface changes, list each added/modified route as `METHOD /path` with a one-line note (auth requirements, query params, response shape).
- **Test plan** — required. A `- [ ]` checklist of concrete steps a reviewer can run to verify the change, grouped by area (backend/frontend) with the command to start each (`npm run dev:backend` / `npm run dev:frontend`). Cover happy paths, validation/error cases, and auth where relevant.
- **Notes** — migrations, env vars, follow-ups, or anything a reviewer must do manually. Omit if empty.

**Rules:**

- Push the branch with upstream tracking (`git push -u origin <branch>`) before/while opening the PR.
- Open as a draft (`--draft`) when the work is still in progress.
- Reference issues in the body footer: `Closes #123`.
- Keep the description in English; user-facing app copy stays Russian per the Language section.
