# apps/backend — CLAUDE.md

Nest.js 10 (Express platform) API for Expence Tracker. Package name
`@expence-tracker/backend`. See the root [`CLAUDE.md`](../../CLAUDE.md) for
monorepo-wide stack, commands, branching and commit rules.

## Run & build

```bash
npm run dev:backend                 # nest start --watch (from repo root)
npm run build:backend               # nest build → apps/backend/dist
npm run start:prod -w apps/backend  # node dist/main.js (after build)
npm run typecheck -w apps/backend   # tsc --noEmit
```

`main.ts` bootstraps the app: loads `dotenv/config`, enables CORS for
`FRONTEND_URL` (`credentials: true`), registers a global `ValidationPipe`, and
listens on `PORT ?? 3001`. There is no lint config and no test runner here yet.

## Modules

`src/` is split into feature modules wired together in `app.module.ts`. Each
module owns a thin controller and a set of CQRS handlers; there are **no
`*.service.ts` files** — business logic lives in command/query handlers.

| Module                 | Path                  | Responsibility                                                                                  |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `AppModule`            | `src/app.module.ts`   | Root module; imports every feature module. `AppController` exposes `GET /health`.                |
| `PrismaModule`         | `src/prisma/`         | `@Global()` module exporting `PrismaService` (extends `PrismaClient`, connects on init).         |
| `UserModule`           | `src/user/`           | User persistence: create user, look up by id / email. Re-exports `CqrsModule` for consumers.     |
| `AuthModule`           | `src/auth/`           | Register / login / me. Hashing (bcrypt), JWT issuing, Passport-JWT strategy + guard, decorators. |
| `CategoriesModule`     | `src/categories/`     | CRUD for user-owned categories (JWT-protected).                                                  |
| `TransactionsModule`   | `src/transactions/`   | CRUD + listing of transactions with month filter, pagination and totals (JWT-protected).         |

`UserModule` is imported by `AuthModule` and `CategoriesModule` so their handlers
can dispatch user queries through the shared `QueryBus`.

## API surface today

| Method & path           | Auth | Notes                                                                            |
| ----------------------- | ---- | -------------------------------------------------------------------------------- |
| `GET /health`           | —    | `{ status }` liveness check.                                                     |
| `POST /auth/register`   | —    | Body `RegisterDto` → `{ accessToken }`.                                          |
| `POST /auth/login`      | —    | Body `LoginDto` → `{ accessToken }`.                                             |
| `GET /auth/me`          | JWT  | Current user → `UserResponseDto`.                                                |
| `GET /categories`       | JWT  | List the user's categories.                                                      |
| `POST /categories`      | JWT  | Body `CreateCategoryDto`.                                                        |
| `PATCH /categories/:id` | JWT  | Body `UpdateCategoryDto`.                                                         |
| `DELETE /categories/:id`| JWT  | `204 No Content`.                                                                 |
| `GET /transactions`     | JWT  | Query `ListTransactionsQueryDto` (`month`+`year` all-or-nothing, `page`, `limit`) → list + totals. |
| `GET /transactions/:id` | JWT  | Single transaction.                                                              |
| `POST /transactions`    | JWT  | Body `CreateTransactionDto`.                                                      |
| `PATCH /transactions/:id`| JWT | Body `UpdateTransactionDto`.                                                      |
| `DELETE /transactions/:id`| JWT| `204 No Content`.                                                                 |

JWT is returned as `{ accessToken }` in the response body and sent back as a
`Bearer` token (7-day expiry).

## Patterns

**CQRS (`@nestjs/cqrs`).** This is the core convention — keep it consistent.

- Each module imports `CqrsModule` and registers its handlers in `providers`.
- A **command** mutates state (`commands/<verb>-<entity>.command.ts` — a plain
  class holding readonly fields). Its handler is
  `commands/<verb>-<entity>.handler.ts`, annotated `@CommandHandler(...)` and
  implementing `ICommandHandler<...>`.
- A **query** reads state (`queries/<name>.query.ts` + `queries/<name>.handler.ts`
  with `@QueryHandler(...)` / `IQueryHandler<...>`).
- Controllers stay thin: they only validate input (DTOs) and dispatch via
  `commandBus.execute(new XCommand(...))` / `queryBus.execute(new XQuery(...))`.
  They never touch Prisma directly.
- Handlers may dispatch other handlers through the injected `CommandBus`/`QueryBus`
  (e.g. `RegisterHandler` → `CreateUserCommand`, `LoginHandler` →
  `GetUserByEmailQuery`) to reuse logic across modules.

When adding a capability: add the command/query class, add its handler, register
the handler in the module's `providers`, and wire the controller route.

**Repository / data access.** `PrismaService` (from the global `PrismaModule`) is
the single data-access layer — it plays the repository role. Only CQRS handlers
inject it; controllers and other layers go through the buses. Ownership is enforced
in handlers by scoping every query/mutation to the authenticated `userId` (e.g.
`where: { id, userId }`) so users can't reach each other's rows. Translate Prisma
error codes into Nest HTTP exceptions in the handler (e.g. unique-constraint `P2002`
→ `ConflictException`).

**Global pipes & auth.**

- A global `ValidationPipe` is registered in `main.ts` with
  `{ whitelist: true, transform: true, forbidNonWhitelisted: true }` — unknown
  body/query fields are rejected (400) and payloads are transformed into DTO
  instances (so `@Type(() => Number)` in query DTOs works). Validation rules live
  on the DTOs in `@expence-tracker/shared`.
- Protect routes with `@UseGuards(JwtAuthGuard)` (class- or method-level). The
  guard wraps Passport's `AuthGuard("jwt")`; `JwtStrategy` validates the Bearer
  token and attaches `{ userId, email }` to the request.
- Read the current user with the `@CurrentUser()` param decorator
  (`CurrentUserPayload`), never off the raw request.

## Prisma & database

Schema lives at `packages/db/prisma/schema.prisma` (PostgreSQL, `DATABASE_URL`).
Models:

- **User** — `id` (cuid), `name`, `email` (unique), `passwordHash`, timestamps;
  has many `categories` and `transactions`.
- **Category** — `id`, `name`, `color` (hex), `icon`, `userId`; `@@unique([userId, name])`,
  `@@index([userId])`; `onDelete: Cascade` from user.
- **Transaction** — `id`, `amount` (`Decimal(12,2)`), `type` (`TransactionType`
  enum `INCOME`/`EXPENSE`), `description`, `date`, `categoryId`, `userId`;
  indexes on `[userId]`, `[userId, date]`, `[userId, categoryId]`. Category
  relation is `onDelete: Restrict` (can't delete a category still in use); user is
  `onDelete: Cascade`.

**Decimal handling.** `amount` is a Prisma `Decimal` in the DB — convert with
`.toNumber()` before returning it in a response DTO (see
`get-user-transactions.handler.ts`), and aggregate with `groupBy` + `_sum` for
totals.

**Workflow after editing the schema:**

```bash
npm run prisma:generate                    # regenerate client + types
npm run prisma:migrate -- --name <name>    # create + apply a dev migration
```

The backend imports `PrismaClient` from `@prisma/client` directly in
`PrismaService`; model/enum types for handlers (`Prisma`, `TransactionType`) come
from `@expence-tracker/db`. Run `prisma:generate` before relying on new types.

## Environment

`apps/backend/.env.example` documents backend-specific vars; the root `.env`
supplies the shared ones (Prisma + JWT). Copy and fill before `npm run dev:backend`.

| Variable       | Default                       | Used by                                            |
| -------------- | ----------------------------- | -------------------------------------------------- |
| `DATABASE_URL` | —                             | Prisma datasource (Postgres connection string).    |
| `JWT_SECRET`   | `change_me_in_production`     | `JwtModule` signing + `JwtStrategy` verification. **Set a real value in prod.** |
| `PORT`         | `3001`                        | `app.listen(...)` in `main.ts`.                    |
| `FRONTEND_URL` | `http://localhost:3000`       | CORS allowed origin (`credentials: true`).         |

## Swagger & JSDoc

**Swagger is not wired up yet** — `@nestjs/swagger` is not a dependency. When the
API surface is documented:

- Add `@nestjs/swagger`, set up `SwaggerModule` in `main.ts`, and keep the spec in
  sync with the routes. **Any PR that adds, removes or changes a route or DTO must
  update the corresponding Swagger decorators** (`@ApiTags`, `@ApiOperation`,
  `@ApiResponse`, `@ApiBearerAuth` on JWT-protected routes) and the response/body
  DTOs in `@expence-tracker/shared`. The Swagger UI is the source of truth for the
  HTTP contract — a route change with stale docs is an incomplete change.
- Until then, the route table above and the DTOs in `packages/shared/src/index.ts`
  are the contract; keep both current when the surface changes.

**JSDoc.** Document the *why*, not the *what*. Add JSDoc/inline comments on
non-obvious logic (e.g. the all-or-nothing `month`/`year` validation in
`ListTransactionsQueryDto`, or the UTC month-range filter in
`GetUserTransactionsHandler`) and on any exported helper/constant in
`@expence-tracker/shared`. Comments are written in Russian to match the existing
code; keep them accurate when you change the code they describe — a stale comment
is worse than none.
