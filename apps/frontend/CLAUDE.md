# apps/frontend — CLAUDE.md

Next.js 15 (App Router) + React 19 + Tailwind 3 web client for Expence Tracker.
Package name `@expence-tracker/frontend`. See the root [`CLAUDE.md`](../../CLAUDE.md)
for monorepo-wide stack, commands, branching and commit rules.

## Run & build

```bash
npm run dev:frontend                 # next dev (from repo root, :3000)
npm run build:frontend               # next build
npm run lint -w apps/frontend        # next lint
npm run typecheck -w apps/frontend   # tsc --noEmit
```

Needs the backend running (`npm run dev:backend`) for live data. `next.config.mjs`
sets `reactStrictMode` and `transpilePackages: ["@expence-tracker/shared"]` so the
shared DTOs are consumed from source.

## Language

User-facing copy is **Russian** (the root layout sets `lang="ru"`). Keep UI text,
labels, validation and error messages in Russian; code and identifiers in English.

## Forms & data

- Forms use **react-hook-form** + **Zod** (`@hookform/resolvers`) with shadcn/ui
  `Form` primitives.
- The JWT is stored in `localStorage` via `entities/session` (`sessionModel`) and
  attached as a `Bearer` token by the shared API client.
- HTTP goes through `shared/api/client.ts` (`apiGet` / `apiPost`), which throws a
  typed `ApiError` and flattens Nest validation arrays into a single message. Don't
  call `fetch` directly from features/widgets — go through the client.

## Architecture — Feature Sliced Design (FSD)

`apps/frontend/src` follows [Feature Sliced Design](https://feature-sliced.design/).
Layers, top to bottom — **imports only ever go downward**:

```
src/
├── app/        # Next.js App Router — routing only; thin pages that compose lower layers
├── widgets/    # Composite UI blocks: app-header, category-list, recent-transactions
├── features/   # User actions: auth, create-category, create-transaction
├── entities/   # Domain objects: session, user, category, transaction
└── shared/     # Framework-agnostic building blocks
    ├── api/    # Base fetch client (apiGet / apiPost, ApiError)
    ├── config/ # Runtime config (API_URL from env)
    ├── lib/    # Utilities (cn from clsx + tailwind-merge)
    └── ui/     # shadcn/ui components (button, card, checkbox, form, input, label, modal, select)
```

**Slice shape.** Each slice (inside `entities`/`features`/`widgets`) is organised
by segment and exposes a public barrel:

```
<slice>/
├── ui/       # components
├── model/    # hooks, stores, client-side logic
├── api/      # network calls for this slice
└── index.ts  # public API — the ONLY thing other slices may import
```

The App Router groups routes with `(auth)` (login/register) and `(app)` (the
authenticated shell — `(app)/layout.tsx` wraps children in `AuthGuard` +
`AppHeader`).

**Import rules:**

- A layer may import only from layers **below** it. `features/*` may use
  `entities/*` and `shared/*`, but **not** other features, widgets, or `app/`.
- **No cross-slice imports inside the same layer.** Always import through a slice's
  public `index.ts` barrel (`@/features/auth`), never a deep path
  (`@/features/auth/ui/login-form`).
- Keep `app/` thin: pages wire widgets/features together and own routing, nothing more.

**Path alias:** `@/*` → `apps/frontend/src/*` (configured in
`apps/frontend/tsconfig.json`). The `@expence-tracker/*` scope resolves to the
shared packages' source.

> Note: this `tsconfig` inherits `noUncheckedIndexedAccess: true` from the base
> config (unlike the backend, which disables it) — guard array/record index access.

## Component library — shadcn/ui

shadcn/ui components live in `shared/ui/`. `apps/frontend/components.json` points
the CLI at `@/shared/ui` (and `@/shared/lib/utils`, `@/shared/hooks`), so new
components land in the right place:

```bash
cd apps/frontend && npx shadcn@latest add <component>
```

- Style `default`, base color `slate`, CSS variables on, Tailwind config
  `tailwind.config.ts`, global styles `src/app/globals.css`.
- Compose with the `cn()` helper from `@/shared/lib/utils`; prefer extending an
  existing `shared/ui` primitive over hand-rolling markup.
- Tailwind scans `./src/**/*.{ts,tsx}`. Icons come from `lucide-react`.

## Environment

Copy `apps/frontend/.env.local.example` → `.env.local` for local dev. Only
`NEXT_PUBLIC_*` vars are exposed to the browser.

| Variable              | Default                   | Used by                                                    |
| --------------------- | ------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001`   | `shared/config` → base URL for the API client (`API_URL`). |

Must match where the backend listens (`PORT`) and the backend's `FRONTEND_URL`
CORS origin (`http://localhost:3000` by default).
