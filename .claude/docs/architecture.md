# Архитектура

Обзор архитектуры Expence Tracker: монорепо, слои, модули и паттерны. Документ
описывает, **как устроен код**; пошаговые инструкции — в [`dev-guide.md`](dev-guide.md),
эндпоинты — в [`api.md`](api.md), схема БД — в [`database.md`](database.md).

## Монорепо

npm workspaces, Node >= 20 (`.nvmrc`). Четыре воркспейса под scope
`@expence-tracker/*`:

| Воркспейс         | Пакет                       | Стек                                                              |
| ----------------- | --------------------------- | ----------------------------------------------------------------- |
| `apps/frontend`   | `@expence-tracker/frontend` | Next.js 15 (App Router) + React 19 + Tailwind 3 + shadcn/ui (FSD) |
| `apps/backend`    | `@expence-tracker/backend`  | Nest.js 10 (Express) + `@nestjs/cqrs` + Passport-JWT + Swagger    |
| `packages/db`     | `@expence-tracker/db`       | Prisma 5 + PostgreSQL; реэкспорт `PrismaClient` / `@prisma/client`|
| `packages/shared` | `@expence-tracker/shared`   | DTO / enum / константы (class-validator), общие для фронта и бэка |

Имена `@expence-tracker/*` также прописаны как `paths` в `tsconfig.base.json` и
указывают на `src/index.ts` каждого пакета — переход к определению ведёт в
исходники, а не в сгенерированные `.d.ts`.

**TS-конфиг.** `tsconfig.base.json` — `strict` + `noUncheckedIndexedAccess: true`.
`apps/backend` отключает этот флаг (и использует `commonjs`/`node` resolution) ради
эргономики DI Nest. Поэтому код, перенесённый из backend во frontend или
`packages/*`, может потребовать дополнительных guard'ов при индексном доступе.

### Поток зависимостей пакетов

```
@expence-tracker/shared ──> apps/backend
        │                        │
        └──────> apps/frontend   └──> @expence-tracker/db ──> apps/backend
```

`shared` не зависит ни от кого (только class-validator/class-transformer). `db`
оборачивает Prisma. И backend, и frontend потребляют DTO из `shared` (фронт
транспилирует пакет из исходников через `transpilePackages`).

---

## Backend — Nest.js + CQRS

`apps/backend` — REST API. Точка входа `src/main.ts` поднимает приложение:
загружает `dotenv/config`, включает CORS для `FRONTEND_URL` (`credentials: true`),
регистрирует глобальный `ValidationPipe`, строит Swagger-спеку и слушает
`PORT ?? 3001`. UI Swagger — на `/docs`.

### Модульная структура

`src/` разбит на фичевые модули, собранные в `app.module.ts`. Каждый модуль владеет
**тонким контроллером** и набором CQRS-хендлеров. Файлов `*.service.ts` нет —
бизнес-логика живёт в обработчиках команд/запросов.

| Модуль               | Путь                | Ответственность                                                                 |
| -------------------- | ------------------- | -------------------------------------------------------------------------------- |
| `AppModule`          | `src/app.module.ts` | Корневой модуль; импортирует все фичевые. `AppController` отдаёт `GET /health`.   |
| `PrismaModule`       | `src/prisma/`       | `@Global()`-модуль, экспортирует `PrismaService` (наследует `PrismaClient`).      |
| `UserModule`         | `src/user/`         | Хранение пользователей: создание, поиск по id / email. Реэкспортирует `CqrsModule`.|
| `AuthModule`         | `src/auth/`         | Регистрация / вход / me. bcrypt, выдача JWT, Passport-JWT стратегия + guard.      |
| `CategoriesModule`   | `src/categories/`   | CRUD категорий пользователя (под JWT).                                            |
| `TransactionsModule` | `src/transactions/` | CRUD + листинг транзакций с фильтром по месяцу, пагинацией и сводкой (под JWT).   |

`UserModule` импортируется в `AuthModule`, `CategoriesModule` и
`TransactionsModule`, чтобы их хендлеры могли диспетчеризовать пользовательские
запросы через общий `QueryBus`.

### Анатомия модуля

```
<module>/
├── <module>.module.ts      # imports: [CqrsModule, ...], controllers, providers (хендлеры)
├── <module>.controller.ts  # тонкий: валидирует DTO и диспетчеризует через шины
├── commands/               # мутации состояния
│   ├── <verb>-<entity>.command.ts   # plain-класс с readonly-полями
│   └── <verb>-<entity>.handler.ts   # @CommandHandler / ICommandHandler
└── queries/                # чтение состояния
    ├── <name>.query.ts              # plain-класс с readonly-полями
    └── <name>.handler.ts            # @QueryHandler / IQueryHandler
```

### Слои и поток запроса

```
HTTP → Controller → CommandBus / QueryBus → Handler → PrismaService → PostgreSQL
          │                                     │
     ValidationPipe (DTO)              может вызвать другой Handler через шину
          │                                     │
      JwtAuthGuard                        @CurrentUser() → { userId, email }
```

1. Запрос проходит глобальный `ValidationPipe` (`whitelist`, `transform`,
   `forbidNonWhitelisted`) — неизвестные поля отклоняются (400), payload
   превращается в экземпляр DTO (работает `@Type(() => Number)`).
2. JWT-маршруты закрыты `JwtAuthGuard` (обёртка над Passport `AuthGuard("jwt")`).
   `JwtStrategy` валидирует Bearer-токен и кладёт `{ userId, email }` в запрос.
3. Контроллер берёт пользователя через `@CurrentUser()` (`CurrentUserPayload`),
   собирает команду/запрос и вызывает `commandBus.execute(...)` /
   `queryBus.execute(...)`. К Prisma напрямую не обращается.
4. Хендлер исполняет бизнес-логику и единственный обращается к `PrismaService`.

### Паттерны

**CQRS (`@nestjs/cqrs`)** — основная конвенция.

- Команда мутирует состояние, запрос читает. Каждый — это plain-класс +
  отдельный класс-хендлер.
- Хендлеры могут вызывать другие хендлеры через `CommandBus`/`QueryBus` ради
  переиспользования логики между модулями (`RegisterHandler` →
  `CreateUserCommand`; `LoginHandler` → `GetUserByEmailQuery`;
  `CreateTransactionHandler` → `GetUserByIdQuery`).
- Хендлеры регистрируются в `providers` модуля.

**Доступ к данным.** `PrismaService` (из глобального `PrismaModule`) — единственный
слой доступа к данным, играет роль репозитория. Его инжектят только CQRS-хендлеры.

**Изоляция владельца.** Каждый запрос/мутация скоупится на аутентифицированный
`userId` (`where: { id, userId }` или явная проверка `category.userId !== userId`),
чтобы пользователи не доставали чужие строки.

**Маппинг ошибок.** Коды ошибок Prisma транслируются в HTTP-исключения Nest прямо
в хендлере (unique-конфликт `P2002` → `ConflictException`; не найдено / чужое →
`NotFoundException`; пользователь не найден → `UnauthorizedException`).

**Decimal.** `amount` хранится как Prisma `Decimal` — перед возвратом в DTO
приводится через `.toNumber()`; для сводок используется `groupBy` + `_sum`.

---

## Frontend — Next.js + Feature Sliced Design

`apps/frontend/src` следует [Feature Sliced Design](https://feature-sliced.design/).
Слои сверху вниз; **импорты идут только вниз**:

```
src/
├── app/        # Next.js App Router — только роутинг; тонкие страницы, компонующие нижние слои
├── widgets/    # Композитные блоки: app-header, category-list, recent-transactions
├── features/   # Действия пользователя: auth, create-category, create-transaction
├── entities/   # Доменные сущности: session, user, category, transaction
└── shared/     # Каркас, независимый от фреймворка
    ├── api/    # Базовый fetch-клиент (apiGet / apiPost, ApiError)
    ├── config/ # Рантайм-конфиг (API_URL из env)
    ├── lib/    # Утилиты (cn из clsx + tailwind-merge)
    └── ui/     # shadcn/ui (button, card, checkbox, form, input, label, modal, select)
```

**Форма слайса.** Каждый слайс в `entities`/`features`/`widgets` организован по
сегментам и выставляет публичный barrel:

```
<slice>/
├── ui/       # компоненты
├── model/    # хуки, сторы, клиентская логика
├── api/      # сетевые вызовы этого слайса
└── index.ts  # публичный API — ЕДИНСТВЕННОЕ, что могут импортировать другие слайсы
```

**Правила импорта.**

- Слой импортирует только из слоёв **ниже**. `features/*` могут использовать
  `entities/*` и `shared/*`, но **не** другие features, widgets или `app/`.
- **Никаких кросс-слайс импортов внутри одного слоя.** Только через публичный
  `index.ts` (`@/features/auth`), не через глубокий путь
  (`@/features/auth/ui/login-form`).
- `app/` тонкий: страницы связывают widgets/features и владеют роутингом.

**Роутинг.** App Router группирует маршруты: `(auth)` (login/register) и `(app)`
(аутентифицированная оболочка — `(app)/layout.tsx` оборачивает детей в `AuthGuard`
+ `AppHeader`).

**Данные и формы.**

- Формы — **react-hook-form** + **Zod** (`@hookform/resolvers`) с примитивами
  `Form` из shadcn/ui.
- JWT хранится в `localStorage` через `entities/session` (`sessionModel`) и
  цепляется как `Bearer` к запросам.
- HTTP идёт через `shared/api/client.ts` (`apiGet` / `apiPost`), который бросает
  типизированный `ApiError` и схлопывает массивы ошибок валидации Nest в одно
  сообщение. Прямой `fetch` из features/widgets запрещён.

**Алиасы.** `@/*` → `apps/frontend/src/*`. Scope `@expence-tracker/*` резолвится
в исходники общих пакетов.

---

## Сквозные соглашения

- **Язык.** Пользовательская копия и комментарии — русский; код, идентификаторы,
  коммиты, PR — английский.
- **DTO — единый контракт.** Backend и frontend используют одни и те же классы DTO
  из `@expence-tracker/shared`; правила валидации (class-validator) живут на них.
- **Документация едет с кодом.** Изменение маршрута/DTO тянет за собой обновление
  Swagger-декораторов, README и этих документов в том же изменении.
