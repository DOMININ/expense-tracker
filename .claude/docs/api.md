# API

Все эндпоинты backend (`apps/backend`). Базовый URL `http://localhost:3001`.
Живая спецификация — Swagger UI на **`/docs`** (источник истины для HTTP-контракта).
Структуру кода см. в [`architecture.md`](architecture.md), схему БД — в
[`database.md`](database.md).

## Общие правила

- **Аутентификация.** JWT передаётся в заголовке `Authorization: Bearer <token>`.
  Токен возвращается в теле как `{ accessToken }` при регистрации/входе, срок
  жизни — 7 дней. Payload токена: `sub` (id пользователя), `email`.
- **Валидация.** Глобальный `ValidationPipe` с `whitelist` + `forbidNonWhitelisted`:
  неизвестные поля тела/квери → `400`. Числовые поля приводятся из строк
  (`@Type(() => Number)`).
- **Изоляция данных.** Каждый ресурс скоупится на пользователя из токена; чужой
  объект отдаёт `404`, как будто его нет.
- **Коды ошибок.** `400` валидация · `401` нет/невалиден токен (или неверные
  креды на login) · `404` не найдено / чужое · `409` конфликт (занятый email,
  дублирующее имя категории, удаление используемой категории).
- DTO определены в `@expence-tracker/shared` (`packages/shared/src/index.ts`).

## Сводка

| Метод и путь               | Auth | Тело / квери                 | Описание                                              |
| -------------------------- | ---- | ---------------------------- | ----------------------------------------------------- |
| `GET /health`              | —    | —                            | Liveness-проверка `{ status }`.                       |
| `POST /auth/register`      | —    | `RegisterDto`                | Регистрация → `{ accessToken }`.                      |
| `POST /auth/login`         | —    | `LoginDto`                   | Вход → `{ accessToken }`.                             |
| `GET /auth/me`             | JWT  | —                            | Текущий пользователь → `UserResponseDto`.             |
| `GET /categories`          | JWT  | —                            | Список категорий пользователя.                        |
| `POST /categories`         | JWT  | `CreateCategoryDto`          | Создать категорию.                                    |
| `PATCH /categories/:id`    | JWT  | `UpdateCategoryDto`          | Обновить категорию (частично).                        |
| `DELETE /categories/:id`   | JWT  | —                            | Удалить категорию (`204`).                            |
| `GET /transactions`        | JWT  | `ListTransactionsQueryDto`   | Список транзакций со сводкой + пагинация.             |
| `GET /transactions/:id`    | JWT  | —                            | Одна транзакция.                                      |
| `POST /transactions`       | JWT  | `CreateTransactionDto`       | Создать транзакцию.                                   |
| `PATCH /transactions/:id`  | JWT  | `UpdateTransactionDto`       | Обновить транзакцию (частично).                       |
| `DELETE /transactions/:id` | JWT  | —                            | Удалить транзакцию (`204`).                           |

---

## System

### `GET /health`
Liveness-проверка. Без авторизации.

**200** → `{ "status": "ok" }`

---

## Auth (`/auth`)

### `POST /auth/register`
Регистрирует пользователя, хеширует пароль (bcrypt, 10 раундов) и выдаёт JWT.

**Тело — `RegisterDto`:**

| Поле       | Тип    | Правила                  |
| ---------- | ------ | ------------------------ |
| `name`     | string | непустая строка          |
| `email`    | string | валидный email           |
| `password` | string | строка, мин. 6 символов  |

**201** → `{ "accessToken": "<jwt>" }`
**400** валидация · **409** email уже занят

### `POST /auth/login`
Проверяет креды, выдаёт JWT.

**Тело — `LoginDto`:** `email` (email), `password` (непустая строка).

**201** → `{ "accessToken": "<jwt>" }`
**400** валидация · **401** неверный email или пароль

### `GET /auth/me` 🔒
Профиль текущего пользователя по токену.

**200** → `UserResponseDto` `{ id, name, email }`
**401** токен отсутствует/невалиден или пользователь не найден

---

## Categories (`/categories`) 🔒

Все маршруты под `JwtAuthGuard`. Категории скоупятся на пользователя; пара
`(userId, name)` уникальна.

**`CategoryResponseDto`:** `{ id, name, color, icon, userId, createdAt, updatedAt }`.

### `GET /categories`
Список категорий пользователя, отсортирован по дате создания (возр.).

**200** → `CategoryResponseDto[]`

### `POST /categories`
**Тело — `CreateCategoryDto`:**

| Поле    | Тип    | Правила                          |
| ------- | ------ | -------------------------------- |
| `name`  | string | непустая, ≤ 50 символов          |
| `color` | string | hex-цвет `#RRGGBB`               |
| `icon`  | string | непустая, ≤ 50 символов          |

**201** → `CategoryResponseDto`
**400** валидация · **409** имя уже занято у пользователя

### `PATCH /categories/:id`
**Тело — `UpdateCategoryDto`** (все поля опциональны, те же правила, что в create):
`name?`, `color?`, `icon?`.

**200** → `CategoryResponseDto`
**400** валидация · **404** не найдено / чужое · **409** имя конфликтует

### `DELETE /categories/:id`
**204** удалено · **404** не найдено / чужое · **409** категория используется
транзакциями (FK `onDelete: Restrict` — сначала удалите транзакции).

---

## Transactions (`/transactions`) 🔒

Все маршруты под `JwtAuthGuard`. `amount` в ответах — `number` (в БД хранится как
`Decimal(12,2)`, приводится `.toNumber()`).

**`TransactionResponseDto`:**
`{ id, amount, type, description, date, categoryId, category, userId, createdAt, updatedAt }`,
где `category` — `CategoryRefDto` `{ id, name, color, icon }`.

### `GET /transactions`
Постраничный список транзакций со сводкой. Три запроса параллельно: страница
(сортировка по `date` убыв., с категориями), общий счётчик и агрегация сумм по типу.

**Квери — `ListTransactionsQueryDto`:**

| Параметр | Тип | Правила                                                       |
| -------- | --- | ------------------------------------------------------------- |
| `month`  | int | 1–12. Фильтр по месяцу — пара «всё-или-ничего» с `year`.      |
| `year`   | int | 1970–2100. Обязателен, если задан `month` (и наоборот).      |
| `page`   | int | ≥ 1, по умолчанию `1`.                                        |
| `limit`  | int | 1–100, по умолчанию `10`.                                     |

Диапазон месяца считается в UTC: `[Date.UTC(year, month-1, 1), Date.UTC(year, month, 1))`.

**200** → `TransactionsListResponseDto`:
```jsonc
{
  "items": [ /* TransactionResponseDto[] */ ],
  "totals": { "income": 0, "expense": 0, "balance": 0 },  // income − expense
  "page": 1,
  "limit": 10,
  "total": 0,        // всего записей по фильтру
  "totalPages": 1    // max(1, ceil(total / limit))
}
```
**400** некорректные параметры (например, `month` без `year`)

### `GET /transactions/:id`
**200** → `TransactionResponseDto`
**404** не найдено / чужое

### `POST /transactions`
Создаёт транзакцию; проверяет, что пользователь существует и категория принадлежит ему.

**Тело — `CreateTransactionDto`:**

| Поле          | Тип    | Правила                                   |
| ------------- | ------ | ----------------------------------------- |
| `amount`      | number | > 0, ≤ 2 знаков после запятой             |
| `type`        | enum   | `INCOME` \| `EXPENSE`                      |
| `description` | string | непустая, ≤ 200 символов                  |
| `date`        | string | ISO-дата (`@IsDateString`)                |
| `categoryId`  | string | непустая строка; категория должна быть своей |

**201** → `TransactionResponseDto`
**400** валидация · **404** категория не найдена / чужая

### `PATCH /transactions/:id`
**Тело — `UpdateTransactionDto`** (все поля опциональны, правила как в create):
`amount?`, `type?`, `description?`, `date?`, `categoryId?`.

**200** → `TransactionResponseDto`
**400** валидация · **404** транзакция или новая категория не найдена / чужая

### `DELETE /transactions/:id`
**204** удалено · **404** не найдено / чужое
