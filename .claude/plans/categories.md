# Categories Module — Implementation Plan

## Context

Авторизация уже реализована (JWT + CQRS в `apps/backend/src/auth` и `apps/backend/src/user`). Следующий шаг — модуль категорий трат, которые в дальнейшем будут привязываться к транзакциям. Цель: добавить полноценный CRUD для сущности `Category`, привязанной к пользователю, с защитой JWT-гардом, валидацией входа через `class-validator` и взаимодействием с `UserModule` через CQRS — единым стилем с уже существующим кодом (handlers через `CommandBus`/`QueryBus`, без традиционных `*.service.ts`).

## Архитектурные решения

- **Чистый CQRS** — `CategoriesService` отсутствует; вся бизнес-логика в командных и запросных handlers (как в `auth`/`user`).
- `icon` — свободная строка (имя иконки), не enum.
- Имя категории уникально в рамках пользователя: `@@unique([userId, name])`.
- `onDelete: Cascade` для связи `User → Category`.

---

## Чек-лист задач

### 1. Prisma schema
- [x] В `packages/db/prisma/schema.prisma` добавить в модель `User` поле `categories Category[]`
- [x] Создать модель `Category` со схемой:
  ```prisma
  model Category {
    id        String   @id @default(cuid())
    name      String
    color     String
    icon      String
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@unique([userId, name])
    @@index([userId])
  }
  ```
- [x] Выполнить `npm run prisma:migrate -- --name add_category_model` (миграция + `prisma generate`)

### 2. Зависимости и глобальная валидация
- [x] `npm install class-validator class-transformer -w apps/backend`
- [x] `npm install class-validator class-transformer -w packages/shared`
- [x] В `apps/backend/src/main.ts` подключить `ValidationPipe` глобально:
  ```ts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  ```

### 3. Shared DTOs (`packages/shared/src/index.ts`)
- [x] Импортировать декораторы из `class-validator`: `IsNotEmpty`, `IsOptional`, `IsString`, `Matches`, `MaxLength`
- [x] Объявить `const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/`
- [x] `CreateCategoryDto`: `name` (`@IsString`, `@IsNotEmpty`, `@MaxLength(50)`), `color` (`@IsString`, `@Matches(HEX_COLOR)`), `icon` (`@IsString`, `@IsNotEmpty`, `@MaxLength(50)`)
- [x] `UpdateCategoryDto`: те же поля, но опциональные (`@IsOptional()`)
- [x] `CategoryResponseDto`: `id`, `name`, `color`, `icon`, `userId`, `createdAt`, `updatedAt`

### 4. Декоратор `@CurrentUser()`
- [x] Создать файл `apps/backend/src/auth/decorators/current-user.decorator.ts`
- [x] Экспортировать интерфейс `CurrentUserPayload { userId: string; email: string }`
- [x] Реализовать `createParamDecorator`, возвращающий `req.user` (совместимо с тем, что возвращает `JwtStrategy.validate()`)

### 5. Расширение UserModule — `GetUserByIdQuery`
- [x] `apps/backend/src/user/queries/get-user-by-id.query.ts` — класс с `userId: string`
- [x] `apps/backend/src/user/queries/get-user-by-id.handler.ts` — `@QueryHandler(GetUserByIdQuery)`, инжектит `PrismaService`, возвращает `prisma.user.findUnique({ where: { id } })`
- [x] Зарегистрировать `GetUserByIdHandler` в `providers` файла `apps/backend/src/user/user.module.ts`

### 6. CategoriesModule — структура
- [x] Создать директорию `apps/backend/src/categories/`
- [x] `commands/create-category.command.ts` — класс с `(userId, name, color, icon)`
- [x] `commands/create-category.handler.ts`:
  - `@CommandHandler(CreateCategoryCommand)`, инжектит `PrismaService` и `QueryBus`
  - Шаг 1: `queryBus.execute(new GetUserByIdQuery(userId))` → если `!user`, бросить `UnauthorizedException` (это и есть CQRS-мост в UserModule)
  - Шаг 2: `prisma.category.create({...})`
  - Шаг 3: ловить P2002 → `ConflictException`
- [x] `commands/update-category.command.ts` — `(userId, categoryId, data: { name?, color?, icon? })`
- [x] `commands/update-category.handler.ts`:
  - Fetch by id; если `!existing || existing.userId !== userId` → `NotFoundException`
  - `prisma.category.update(...)`; ловить P2002 → `ConflictException`
- [x] `commands/delete-category.command.ts` — `(userId, categoryId)`
- [x] `commands/delete-category.handler.ts`:
  - Тот же fetch+check → `NotFoundException` при отсутствии/чужой записи
  - `prisma.category.delete(...)`, return `void`
- [x] `queries/get-user-categories.query.ts` — класс с `userId: string`
- [x] `queries/get-user-categories.handler.ts` — `prisma.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })`

### 7. CategoriesController
- [x] Создать `apps/backend/src/categories/categories.controller.ts`
- [x] `@Controller("categories")` + `@UseGuards(JwtAuthGuard)` на класс
- [x] Инжектить `CommandBus`, `QueryBus`
- [x] `POST /` — `@Body() dto: CreateCategoryDto`, `@CurrentUser() user` → `CreateCategoryCommand`
- [x] `GET /` — `@CurrentUser() user` → `GetUserCategoriesQuery`
- [x] `PATCH /:id` — `@Body() dto: UpdateCategoryDto`, `@Param("id")` → `UpdateCategoryCommand`
- [x] `DELETE /:id` с `@HttpCode(204)` → `DeleteCategoryCommand`

### 8. CategoriesModule
- [x] Создать `apps/backend/src/categories/categories.module.ts`
- [x] `imports: [CqrsModule, UserModule]`
- [x] `controllers: [CategoriesController]`
- [x] `providers: [CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler, GetUserCategoriesHandler]`
- [x] (PrismaModule не подключать — он `@Global`)

### 9. AppModule
- [x] В `apps/backend/src/app.module.ts` добавить `CategoriesModule` в `imports`

---

## Verification

- [x] `npm install` в корне (после правок package.json)
- [x] `npm run prisma:migrate -- --name add_category_model`
- [x] `npm run typecheck -w packages/db`
- [x] `npm run typecheck -w packages/shared`
- [x] `npm run typecheck -w apps/backend`
- [x] `npm run dev:backend` и прогон через curl:
  - [x] `POST /auth/register` → получить `accessToken`
  - [x] `POST /categories` `{"name":"Food","color":"#FF8800","icon":"utensils"}` → 201, объект
  - [x] `GET /categories` → массив с одной записью
  - [x] `PATCH /categories/:id` `{"color":"#112233"}` → обновлённая запись
  - [x] `DELETE /categories/:id` → 204

### Негативные сценарии
- [x] Без `Authorization` заголовка → 401 (JwtAuthGuard)
- [x] `color: "red"` → 400 (валидация regex)
- [x] Лишнее поле `{"foo": 1}` → 400 (`forbidNonWhitelisted`)
- [x] Повтор `name` для того же пользователя → 409 (P2002)
- [x] `PATCH`/`DELETE` чужой `id` (второй пользователь) → 404

---

## Критические файлы

- `packages/db/prisma/schema.prisma` — модель `Category`, связь с `User`
- `packages/shared/src/index.ts` — DTO с валидацией
- `apps/backend/src/main.ts` — глобальный `ValidationPipe`
- `apps/backend/src/auth/decorators/current-user.decorator.ts` — новый
- `apps/backend/src/user/queries/get-user-by-id.{query,handler}.ts` — новые
- `apps/backend/src/user/user.module.ts` — регистрация нового handler
- `apps/backend/src/categories/**` — весь новый модуль
- `apps/backend/src/app.module.ts` — подключение `CategoriesModule`
