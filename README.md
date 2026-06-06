# Expence Tracker

Monorepo для трекера расходов.

## Стек

- **Monorepo:** npm workspaces
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — `apps/frontend`
- **Backend:** Nest.js + TypeScript — `apps/backend`
- **БД:** PostgreSQL + Prisma — `packages/db`
- **Общие типы:** `packages/shared`

## Структура

```
apps/
  frontend/   # Next.js
  backend/    # Nest.js
packages/
  db/       # Prisma schema + client
  shared/   # общие типы/DTO
```

## Следующие шаги

1. `npm install` в корне.
2. Описать модели в `packages/db/prisma/schema.prisma`.
3. `npm run prisma:migrate -- --name init`.
4. `npm run dev:backend` и `npm run dev:frontend`.
