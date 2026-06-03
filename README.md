# Expence Tracker

Monorepo для трекера расходов.

## Стек

- **Monorepo:** npm workspaces
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — `apps/web`
- **Backend:** Nest.js + TypeScript — `apps/api`
- **БД:** PostgreSQL + Prisma — `packages/db`
- **Общие типы:** `packages/shared`

## Структура

```
apps/
  web/      # Next.js
  api/      # Nest.js
packages/
  db/       # Prisma schema + client
  shared/   # общие типы/DTO
```

## Следующие шаги

1. `npm install` в корне.
2. Описать модели в `packages/db/prisma/schema.prisma`.
3. `npm run prisma:migrate -- --name init`.
4. `npm run dev:api` и `npm run dev:web`.
