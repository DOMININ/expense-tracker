# Code Review Guidelines

Rules for reviewing pull requests in **Expence Tracker**. They encode the
conventions from the root [`CLAUDE.md`](CLAUDE.md) and the per-workspace files
([`apps/backend/CLAUDE.md`](apps/backend/CLAUDE.md),
[`apps/frontend/CLAUDE.md`](apps/frontend/CLAUDE.md)). A reviewer's job is to keep
those conventions consistent — not to re-litigate them per PR.

The review itself (comments, summaries) is written in **English**. User-facing app
copy stays **Russian** — flag English UI strings, not English review notes.

## How to review

1. Read the PR description first. It must follow the **Pull Requests** format from
   [`CLAUDE.md`](CLAUDE.md) — **Summary**, **Changes**, **Endpoints** (if the API
   surface changed), and a **Test plan** checklist. A missing or empty test plan is
   a blocking comment on its own.
2. Run `git diff main...HEAD` (or read the PR diff) before commenting, so feedback
   is grounded in the actual change, not assumptions.
3. Check the branch and title follow the **GitHub Flow** and **Commit conventions**
   sections of [`CLAUDE.md`](CLAUDE.md): `<type>/<short-slug>` branch,
   `<type>(<scope>): <description>` title, one feature per branch.
4. Verify the change is self-contained — schema edits ship with a migration, route
   changes ship with the matching DTOs and docs (see below).

## Severity

Label every comment so the author knows what blocks merge:

- **blocking** — must fix before merge (correctness, security, broken convention,
  missing migration, ownership leak).
- **suggestion** — should fix, but author's call (naming, structure, small
  simplification).
- **nit** — optional polish (style, wording). Prefix with `nit:`.

Praise good patterns too — it reinforces the conventions for next time.

## Reviewer checklist — always check

Run this pass on every PR, regardless of size. Area-specific checks come after.

- [ ] Branch off `main`, named `<type>/<short-slug>`; no direct commits to `main`.
- [ ] Title and commits follow Conventional Commits (English, imperative,
      lowercase, ≤ 72 chars; correct `type` and `scope`).
- [ ] PR description complete, with a runnable **Test plan**.
- [ ] No secrets, tokens, or real `.env` values committed; new env vars are
      documented in the relevant `.env.example` and the workspace CLAUDE.md table.
- [ ] Code, identifiers, and comments in English; user-facing copy in Russian.
- [ ] No unrelated changes bundled in (keep the diff scoped to one feature).
- [ ] `npm run typecheck -w <workspace>` is clean for every touched workspace.
- [ ] Shared types live in `@expence-tracker/shared`, not duplicated per app.
- [ ] No new dependency added without a reason in the PR description.
- [ ] There is still no test runner wired up — don't approve a PR that *claims*
      tests pass. Require the manual test plan instead.

## Backend (`apps/backend`)

- [ ] **CQRS is followed.** State changes go through a command + `@CommandHandler`;
      reads through a query + `@QueryHandler`. No `*.service.ts` files — business
      logic lives in handlers.
- [ ] Controllers stay thin: validate DTO input and dispatch via
      `commandBus` / `queryBus`. They never touch `PrismaService` directly.
- [ ] New handler is registered in its module's `providers`, and the route is wired
      in the controller.
- [ ] Cross-module logic is reused via the buses (e.g. dispatch an existing
      command/query) rather than reaching into another module's internals.
- [ ] **Ownership is enforced.** Every Prisma query/mutation on user-owned data is
      scoped to the authenticated `userId` (`where: { id, userId }`). A handler that
      can read or mutate another user's row is a **blocking** security bug.
- [ ] Protected routes carry `@UseGuards(JwtAuthGuard)`; the current user is read via
      the `@CurrentUser()` decorator, never off the raw request.
- [ ] Prisma error codes are translated to Nest HTTP exceptions in the handler
      (e.g. `P2002` → `ConflictException`).
- [ ] **Decimal handling:** `Transaction.amount` is a Prisma `Decimal` — converted
      with `.toNumber()` before it goes into a response DTO; totals aggregated with
      `groupBy` + `_sum`.
- [ ] Validation rules live on DTOs in `@expence-tracker/shared` (class-validator).
      The global `ValidationPipe` has `whitelist` + `forbidNonWhitelisted`, so query
      DTOs that need coercion use `@Type(() => Number)` etc.
- [ ] **Schema change ⇒ migration.** Any edit to `packages/db/prisma/schema.prisma`
      ships with a migration (`npm run prisma:migrate -- --name <name>`) and a
      regenerated client. Index/relation/`onDelete` choices match the model intent.
- [ ] **Route or DTO change ⇒ docs updated.** Keep the API table in
      `apps/backend/CLAUDE.md` and the DTOs in `packages/shared` current. Once
      `@nestjs/swagger` is wired up, the Swagger decorators
      (`@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiBearerAuth`) must move with the
      route — a route change with stale docs is incomplete.
- [ ] JSDoc/comments explain the *why* on non-obvious logic (date-range filters,
      all-or-nothing query params), written in Russian to match existing code, and
      kept accurate when the code changes.

## Frontend (`apps/frontend`)

- [ ] **FSD layering respected.** Imports only go downward
      (`app → widgets → features → entities → shared`). No imports from a layer at or
      above the current one. A `feature` importing another `feature`/`widget`/`app`
      is **blocking**.
- [ ] **No cross-slice deep imports.** Other slices are reached only through the
      public `index.ts` barrel (`@/features/auth`), never `@/features/auth/ui/...`.
- [ ] `app/` pages stay thin — they wire widgets/features and own routing only.
- [ ] All HTTP goes through `shared/api/client.ts` (`apiGet`/`apiPost`); no direct
      `fetch` in features/widgets. Errors surface as the typed `ApiError`.
- [ ] Forms use react-hook-form + Zod with shadcn/ui `Form` primitives; validation
      and error messages are in Russian.
- [ ] New UI primitives come from shadcn/ui in `shared/ui` (via
      `npx shadcn@latest add`), composed with the `cn()` helper — not hand-rolled
      when a primitive exists.
- [ ] `noUncheckedIndexedAccess` is on here (unlike backend) — array/record index
      access is guarded.
- [ ] Session/JWT handling stays in `entities/session`; tokens aren't read from
      `localStorage` ad hoc elsewhere.
- [ ] `npm run lint -w apps/frontend` is clean.

## Shared & DB packages

- [ ] DTOs/enums/constants shared between apps live in `packages/shared` with their
      class-validator rules; no duplicate definitions in an app.
- [ ] A `packages/db` schema change is accompanied by `prisma:generate` so dependent
      types are current, and a migration as above.
- [ ] Changes here are reviewed for blast radius — both apps consume these packages
      from source.

## Style & naming

Identifiers, comments, and commits are in **English**; user-facing copy in
**Russian**. Beyond that, naming should match what's already in the touched area —
flag deviations, not personal taste.

**TypeScript:**

- `camelCase` for variables and functions; `PascalCase` for types, classes,
  enums, and React components; `UPPER_SNAKE_CASE` for true constants.
- No abbreviations that aren't already used in the codebase; no Hungarian notation.
- Prefer explicit return types on exported functions; let inference handle locals.

**Backend (`apps/backend`):**

- File names are kebab-case and segment-suffixed:
  `commands/<verb>-<entity>.command.ts` + `<verb>-<entity>.handler.ts`,
  `queries/<name>.query.ts` + `<name>.handler.ts`.
- Class names: `XCommand` / `XHandler` (with `@CommandHandler`), `XQuery` /
  `XHandler` (with `@QueryHandler`), `XModule`, `XController`.
- DTOs read `CreateXDto`, `UpdateXDto`, `XResponseDto`; list query DTOs
  `ListXQueryDto`.

**Frontend (`apps/frontend`):**

- Slices and segments are kebab-case (`app-header`, `recent-transactions`,
  `create-category`); each slice keeps the `ui` / `model` / `api` + `index.ts`
  shape.
- Components are `PascalCase`; hooks are `useXxx`; the public barrel is always
  `index.ts`.
- Import via the `@/` alias and the slice barrel, not deep relative paths.

**Branches & commits:** `<type>/<short-slug>` (lowercase, hyphenated) and
Conventional Commits `<type>(<scope>): <description>` — covered in the always-check
pass; don't restate per comment.

## What to skip

Keep review focused. Don't spend reviewer or author time on:

- **Formatting and whitespace** — owned by the linter/formatter (`next lint`, TS).
  If it passes tooling, don't hand-review indentation or quote style.
- **Naming that already follows the conventions above** — no bikeshedding over
  equally-valid names.
- **Generated artifacts** — the Prisma client, `dist/`, lockfile churn from a
  legitimate dependency change. Review the *source* change, not the output.
- **Tests** — there is no test runner wired up yet, so don't ask for unit tests.
  Require the manual **Test plan** in the PR description instead.
- **Russian copy wording** — leave phrasing to the author unless it's wrong,
  misleading, or accidentally in English.
- **Pre-existing issues unrelated to the diff** — note them as a non-blocking
  follow-up (or an issue), don't hold the PR hostage to them.
- **Personal preferences not written down** — if a rule isn't in `CLAUDE.md` or
  this file, raise it as a `nit:` / `suggestion`, never as blocking. Propose adding
  it to the conventions instead of enforcing it ad hoc.
