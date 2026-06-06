# База данных

Схема PostgreSQL под управлением Prisma 5. Определение —
`packages/db/prisma/schema.prisma`; подключение — через `DATABASE_URL`. Клиент и
типы (`Prisma`, `TransactionType`) реэкспортируются из `@expence-tracker/db`.
Эндпоинты, использующие эти таблицы, — в [`api.md`](api.md); работа со схемой в
коде — в [`dev-guide.md`](dev-guide.md).

## ER-обзор

```
User 1───* Category 1───* Transaction
  │                            │
  └──────────── 1───* ─────────┘
```

- `User` → `Category`: один-ко-многим, `onDelete: Cascade` (удаление пользователя
  уносит его категории).
- `User` → `Transaction`: один-ко-многим, `onDelete: Cascade`.
- `Category` → `Transaction`: один-ко-многим, `onDelete: Restrict` — нельзя удалить
  категорию, пока на неё ссылаются транзакции (даёт `409` в API).

---

## Модель `User`

Учётная запись. Пароль хранится только в виде хеша (bcrypt, 10 раундов).

| Поле           | Тип        | Атрибуты              | Назначение                              |
| -------------- | ---------- | --------------------- | --------------------------------------- |
| `id`           | `String`   | `@id @default(cuid())`| Первичный ключ (cuid).                  |
| `name`         | `String`   | —                     | Отображаемое имя.                       |
| `email`        | `String`   | `@unique`             | Логин; уникален по всей таблице.        |
| `passwordHash` | `String`   | —                     | bcrypt-хеш пароля. Открытый пароль не хранится. |
| `createdAt`    | `DateTime` | `@default(now())`     | Момент создания.                        |
| `updatedAt`    | `DateTime` | `@updatedAt`          | Авто-обновление при изменении.          |
| `categories`   | `Category[]`| relation             | Категории пользователя.                 |
| `transactions` | `Transaction[]`| relation          | Транзакции пользователя.                |

**Ограничения/индексы:** `email` уникален.

---

## Модель `Category`

Категория трат/доходов, принадлежит пользователю.

| Поле           | Тип        | Атрибуты              | Назначение                              |
| -------------- | ---------- | --------------------- | --------------------------------------- |
| `id`           | `String`   | `@id @default(cuid())`| Первичный ключ.                         |
| `name`         | `String`   | —                     | Название (≤ 50 символов на уровне DTO). |
| `color`        | `String`   | —                     | Hex-цвет `#RRGGBB` (валидируется в DTO).|
| `icon`         | `String`   | —                     | Идентификатор иконки (≤ 50).            |
| `userId`       | `String`   | FK → `User.id`        | Владелец.                               |
| `user`         | `User`     | `onDelete: Cascade`   | Связь с пользователем.                  |
| `transactions` | `Transaction[]`| relation          | Транзакции этой категории.              |
| `createdAt`    | `DateTime` | `@default(now())`     | Момент создания (сортировка списка).    |
| `updatedAt`    | `DateTime` | `@updatedAt`          | Авто-обновление.                        |

**Ограничения/индексы:**
- `@@unique([userId, name])` — у одного пользователя нет двух категорий с одним
  именем (нарушение → `P2002` → `409`).
- `@@index([userId])` — быстрый листинг категорий пользователя.

---

## Enum `TransactionType`

```prisma
enum TransactionType {
  INCOME    // доход (учитывается в totals.income)
  EXPENSE   // расход (учитывается в totals.expense)
}
```

Тот же enum продублирован в `@expence-tracker/shared` для валидации DTO и фронта.

## Модель `Transaction`

Операция дохода/расхода, привязана к пользователю и категории.

| Поле          | Тип               | Атрибуты               | Назначение                                  |
| ------------- | ----------------- | ---------------------- | ------------------------------------------- |
| `id`          | `String`          | `@id @default(cuid())` | Первичный ключ.                             |
| `amount`      | `Decimal`         | `@db.Decimal(12,2)`    | Сумма (всегда > 0). В API приводится к `number` через `.toNumber()`. |
| `type`        | `TransactionType` | —                      | `INCOME` или `EXPENSE`.                     |
| `description` | `String`          | —                      | Описание (≤ 200 символов на уровне DTO).    |
| `date`        | `DateTime`        | —                      | Дата операции; по ней идёт фильтр по месяцу (UTC) и сортировка. |
| `categoryId`  | `String`          | FK → `Category.id`     | Категория операции.                         |
| `category`    | `Category`        | `onDelete: Restrict`   | Связь; блокирует удаление используемой категории. |
| `userId`      | `String`          | FK → `User.id`         | Владелец.                                   |
| `user`        | `User`            | `onDelete: Cascade`    | Связь с пользователем.                      |
| `createdAt`   | `DateTime`        | `@default(now())`      | Момент создания.                            |
| `updatedAt`   | `DateTime`        | `@updatedAt`           | Авто-обновление.                            |

**Индексы:**
- `@@index([userId])` — выборки пользователя.
- `@@index([userId, date])` — фильтр/сортировка по месяцу.
- `@@index([userId, categoryId])` — выборки по категории.

**Почему `Decimal(12,2)`.** Деньги нельзя хранить как `float` (ошибки округления).
12 значащих цифр, 2 после запятой. Prisma возвращает `Decimal` — перед отдачей в
DTO вызывается `.toNumber()`, а сводки считаются через `groupBy(['type']) + _sum`.

---

## Миграции

Лежат в `packages/db/prisma/migrations/`. Текущая история:

| Миграция                              | Что добавила                             |
| ------------------------------------- | ---------------------------------------- |
| `20260522174207_add_user`             | Таблица `User`.                          |
| `20260522194346_add_category_model`   | Таблица `Category` + связь с `User`.     |
| `20260524113055_add_transactions`     | Enum `TransactionType` + таблица `Transaction`. |

Создание/применение миграций и регенерация клиента описаны в
[`dev-guide.md`](dev-guide.md). Кратко:

```bash
npm run prisma:migrate -- --name <name>   # создать + применить dev-миграцию
npm run prisma:generate                    # перегенерировать клиент и типы
npm run prisma:studio                      # GUI к БД
```

Локальный PostgreSQL поднимается через `docker compose up -d` (порт `:5432`,
дефолты: пользователь `user`, пароль `password`, БД `expence_tracker`).
