# Expence Tracker

Приложение для учёта личных доходов и расходов. Пользователь регистрируется,
заводит категории трат, записывает транзакции (доход/расход) и видит список
операций за месяц со сводкой по балансу.

Реализовано сегодня:

- **Auth** — регистрация, вход (JWT, 7 дней), `GET /auth/me`.
- **Categories** — CRUD категорий, привязанных к пользователю.
- **Transactions** — CRUD транзакций с фильтром по месяцу, пагинацией и сводкой
  (доход / расход / баланс).
- **Frontend** — страницы входа/регистрации, домашний экран с последними
  транзакциями и категориями, создание категорий и транзакций.

> User-facing-копия приложения на русском. Код, идентификаторы и коммиты — на
> английском. Подробные правила разработки см. в [`CLAUDE.md`](CLAUDE.md) и в
> per-workspace файлах ([backend](apps/backend/CLAUDE.md),
> [frontend](apps/frontend/CLAUDE.md)). Правила код-ревью — в [`REVIEW.md`](REVIEW.md).

## Стек

npm workspaces монорепо. Четыре воркспейса под scope `@expence-tracker/*`:

| Воркспейс         | Пакет                       | Стек                                                              |
| ----------------- | --------------------------- | ----------------------------------------------------------------- |
| `apps/frontend`   | `@expence-tracker/frontend` | Next.js 15 (App Router) + React 19 + Tailwind 3 + shadcn/ui (FSD) |
| `apps/backend`    | `@expence-tracker/backend`  | Nest.js 10 (Express) + `@nestjs/cqrs` + Passport-JWT + Swagger    |
| `packages/db`     | `@expence-tracker/db`       | Prisma 5 + PostgreSQL; реэкспорт `PrismaClient`                   |
| `packages/shared` | `@expence-tracker/shared`   | DTO / enum / константы (class-validator), общие для фронта и бэка |

## Требования

- **Node.js >= 20** (версия закреплена в [`.nvmrc`](.nvmrc) — `nvm use`).
- **npm** (идёт в комплекте с Node; workspaces требуют npm 7+).
- **Docker** + Docker Compose — для локального PostgreSQL (или свой Postgres на `:5432`).

## Быстрый старт

```bash
# 1. Зависимости (бутстрап всех воркспейсов)
npm install

# 2. Переменные окружения — скопировать примеры и заполнить
cp .env.example .env                              # DATABASE_URL (Prisma + backend)
cp apps/backend/.env.example apps/backend/.env    # PORT, при необходимости JWT_SECRET и др.
cp apps/frontend/.env.local.example apps/frontend/.env.local  # NEXT_PUBLIC_API_URL

# 3. База данных — поднять локальный PostgreSQL в Docker (порт :5432)
docker compose up -d

# 4. Миграции + генерация Prisma-клиента
npm run prisma:migrate      # применить миграции (создать схему)
npm run prisma:generate     # сгенерировать Prisma-клиент и типы

# 5. Dev-серверы (в двух терминалах)
npm run dev:backend         # Nest watch, http://localhost:3001
npm run dev:frontend        # Next.js,    http://localhost:3000
```

После запуска бэкенда Swagger UI доступен на **http://localhost:3001/docs**.

### Переменные окружения

| Переменная            | Где                        | Назначение                                            |
| --------------------- | -------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`        | `.env`                     | Строка подключения PostgreSQL (Prisma + backend).     |
| `JWT_SECRET`          | `.env` / окружение         | Секрет подписи и проверки JWT. **Задать в проде.**    |
| `PORT`                | `apps/backend/.env`        | Порт API (по умолчанию `3001`).                       |
| `FRONTEND_URL`        | окружение backend          | Разрешённый CORS-origin (по умолчанию `:3000`).       |
| `NEXT_PUBLIC_API_URL` | `apps/frontend/.env.local` | Базовый URL API для фронтенда (по умолчанию `:3001`). |

Дефолты Docker Compose: пользователь `user`, пароль `password`, БД `expence_tracker`.

### Полезные команды

```bash
npm run build:backend        # nest build → apps/backend/dist
npm run build:frontend       # next build
npm run prisma:studio        # Prisma Studio (GUI к БД)
npm run prisma:migrate -- --name <name>   # создать + применить dev-миграцию
npm run typecheck -w <workspace>          # tsc --noEmit в воркспейсе
npm run lint -w apps/frontend             # next lint
npm test -w apps/frontend                 # Jest unit-тесты (apps/frontend)
```

> Юнит-тесты подключены во `apps/frontend` (Jest + Testing Library); в остальных
> воркспейсах тест-раннер пока не настроен.

## Структура проекта

```
expence-tracker/
├── apps/
│   ├── backend/                 # Nest.js API (CQRS, без *.service.ts)
│   │   └── src/
│   │       ├── auth/            # регистрация, вход, JWT-стратегия и гард
│   │       ├── categories/      # CRUD категорий
│   │       ├── transactions/    # CRUD + листинг транзакций со сводкой
│   │       ├── user/            # создание/поиск пользователей
│   │       ├── prisma/          # глобальный PrismaService
│   │       └── main.ts          # bootstrap + Swagger (/docs)
│   └── frontend/                # Next.js, Feature Sliced Design
│       └── src/
│           ├── app/             # App Router: (auth) и (app) группы
│           ├── widgets/         # app-header, category-list, recent-transactions
│           ├── features/        # auth, create-category, create-transaction
│           ├── entities/        # session, user, category, transaction
│           └── shared/          # api-клиент, config, ui (shadcn), lib
├── packages/
│   ├── db/                      # Prisma schema, миграции, PrismaClient
│   └── shared/                  # общие DTO / enum / константы
├── docker-compose.yml           # PostgreSQL 16
├── CLAUDE.md                    # гайд по проекту (для Claude Code и людей)
└── REVIEW.md                    # правила код-ревью
```

Каждый фичевый модуль бэкенда следует CQRS: тонкий контроллер диспетчеризует
команды/запросы, бизнес-логика живёт в хендлерах, доступ к данным — только через
`PrismaService`. Фронтенд организован по FSD: импорты идут только «вниз» по слоям
(`app → widgets → features → entities → shared`).

## Основные эндпоинты

Базовый URL: `http://localhost:3001`. JWT передаётся как `Bearer`-токен; в ответ
на регистрацию/вход возвращается `{ accessToken }`. Полная спецификация — в
Swagger UI на `/docs`.

| Метод и путь               | Auth | Описание                                                            |
| -------------------------- | ---- | ------------------------------------------------------------------- |
| `GET /health`              | —    | Liveness-проверка `{ status }`.                                     |
| `POST /auth/register`      | —    | Регистрация → `{ accessToken }`.                                    |
| `POST /auth/login`         | —    | Вход → `{ accessToken }`.                                           |
| `GET /auth/me`             | JWT  | Текущий пользователь.                                               |
| `GET /categories`          | JWT  | Список категорий пользователя.                                      |
| `POST /categories`         | JWT  | Создать категорию.                                                  |
| `PATCH /categories/:id`    | JWT  | Обновить категорию.                                                 |
| `DELETE /categories/:id`   | JWT  | Удалить категорию (`204`; запрещено, если есть транзакции).         |
| `GET /transactions`        | JWT  | Список транзакций: фильтр `month`+`year`, `page`, `limit` + сводка. |
| `GET /transactions/:id`    | JWT  | Одна транзакция.                                                    |
| `POST /transactions`       | JWT  | Создать транзакцию.                                                 |
| `PATCH /transactions/:id`  | JWT  | Обновить транзакцию.                                                |
| `DELETE /transactions/:id` | JWT  | Удалить транзакцию (`204`).                                         |
