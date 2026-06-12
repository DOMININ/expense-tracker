---
name: add-tests
description: Generate Jest unit tests for a given source file in the Expence Tracker monorepo, bootstrapping the Jest setup for that workspace the first time. Use whenever the user asks to add, write, or generate unit tests for a file.
allowed-tools: Bash(npm *), Bash(npx *), Bash(git *), Read, Grep, Glob, Edit, Write
argumentsHint: "path/to/file (the source file to test)"
---

# Add Tests

Write **Jest** unit tests for a single source file passed as the argument.

## Argument

Invoked as `/add-tests <path/to/file>`. `$ARGUMENTS` is the path to the source file
to cover. If no path is given, ask the user which file to test — do not guess.

Resolve the file's workspace from its path:

- `apps/backend/**` → backend (Nest.js): `@nestjs/testing` + `ts-jest`, tests as `*.spec.ts`.
- `apps/frontend/**` → frontend (Next.js/React): `@testing-library/react` + `jsdom`, tests as `*.test.tsx` (`*.test.ts` for non-component modules).
- `packages/shared/**`, `packages/db/**` → plain `ts-jest`, tests as `*.spec.ts`.

## Steps

1. **Read the target.** Read the file and the things it imports (collaborators, DTOs from
   `@expence-tracker/shared`, Prisma types) so the tests exercise real behavior, not guesses.
2. **Check the Jest setup.** This repo has no test runner wired up yet. If the file's
   workspace has no Jest config / `test` script, bootstrap it **once** (see below) before
   writing the spec. If it's already set up, reuse the existing config and conventions.
3. **Write the spec** next to the source file using the workspace naming convention above
   (e.g. `auth.service.ts` → `auth.service.spec.ts`). Mirror the source directory; do not
   invent a separate `__tests__` tree unless the workspace already uses one.
4. **Run it** with `npm test -w <workspace>` (or a path filter) and iterate until green.
   Per CLAUDE.md: never claim tests pass without actually running them.

## What to cover

- The public surface of the file (exported functions / class methods, the Nest provider's API).
- Happy path **and** edge/error cases: validation failures, thrown exceptions, empty/`null` inputs, boundary values.
- For Nest providers, build the unit under test with `Test.createTestingModule` and **mock
  every injected dependency** (repositories, `PrismaService`, CQRS bus, other services) — a
  unit test must not hit Postgres or the network.
- For React, render with `@testing-library/react`, assert on visible output and user
  interactions (`@testing-library/user-event`); mock fetch/API modules.
- Keep one behavior per `it`, descriptive names, Arrange-Act-Assert structure.

## Bootstrapping Jest (first time only)

Only when the workspace has no Jest yet. Match the workspace, then update `README.md` /
the root `Common commands` so the new `test` script is documented (CLAUDE.md requires docs
to stay in sync).

**Backend (`apps/backend`)** — the Nest-standard toolchain:

```bash
npm i -D -w apps/backend jest ts-jest @types/jest @nestjs/testing
```

Add a `jest` config (preset `ts-jest`, `testEnvironment: node`, `rootDir: src`,
`testRegex: '.*\\.spec\\.ts$'`) and a `"test": "jest"` script to `apps/backend/package.json`.

**Frontend (`apps/frontend`)**:

```bash
npm i -D -w apps/frontend jest ts-jest @types/jest jest-environment-jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Config with `testEnvironment: jsdom`, a `setupFilesAfterEnv` importing
`@testing-library/jest-dom`, and module/path mapping for the `@expence-tracker/*` aliases
and `@/*` so imports resolve.

**Shared / db packages** — `npm i -D -w <pkg> jest ts-jest @types/jest`, `ts-jest` preset,
`testEnvironment: node`.

In every case wire `paths` from `tsconfig.base.json` into Jest's `moduleNameMapper` so
`@expence-tracker/*` imports resolve in tests.

## Never

- Never weaken the code under test to make a test pass — fix the test, or report a real bug.
- Never write tests that hit a live database, network, or external service in a unit spec.
- Never delete or rewrite unrelated existing tests.
- Never report a suite as passing without running `npm test`.
