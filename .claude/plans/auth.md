# План: Авторизация через JWT + CQRS

## Контекст

API сейчас — минимальный скаффолд с одним `GET /health`. Нужно добавить:
- Модуль пользователя (User) с полями name, email, passwordHash
- Модуль авторизации (Auth) с методами register и login через JWT
- Взаимодействие между Auth и User через CQRS (без прямых импортов сервисов)

## Чек-лист задач

### Подготовка
- [x] Установить зависимости: `@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @nestjs/cqrs`
- [x] Установить dev-зависимости: `@types/passport-jwt @types/bcrypt`
- [x] Добавить `JWT_SECRET` в `.env`

### Prisma — модель User
- [x] Добавить модель `User` в `packages/db/prisma/schema.prisma` (поля: id, name, email, passwordHash, createdAt, updatedAt)
- [x] Запустить `npm run prisma:migrate -- --name add-user`
- [x] Запустить `npm run prisma:generate`

### PrismaModule
- [x] Создать `apps/api/src/prisma/prisma.service.ts` (extends PrismaClient, implements OnModuleInit)
- [x] Создать `apps/api/src/prisma/prisma.module.ts` (Global, экспортирует PrismaService)

### UserModule (CQRS)
- [x] `apps/api/src/user/commands/create-user.command.ts`
- [x] `apps/api/src/user/commands/create-user.handler.ts` (PrismaService → prisma.user.create)
- [x] `apps/api/src/user/queries/get-user-by-email.query.ts`
- [x] `apps/api/src/user/queries/get-user-by-email.handler.ts` (PrismaService → prisma.user.findUnique)
- [x] `apps/api/src/user/user.module.ts` (импортирует CqrsModule + PrismaModule, регистрирует handlers, экспортирует CqrsModule)

### Shared DTOs
- [x] Добавить `RegisterDto`, `LoginDto`, `AuthResponseDto` в `packages/shared/src/index.ts`

### AuthModule (CQRS + JWT)
- [x] `apps/api/src/auth/commands/register.command.ts`
- [x] `apps/api/src/auth/commands/register.handler.ts` (bcrypt.hash → CreateUserCommand → JwtService.sign)
- [x] `apps/api/src/auth/queries/login.query.ts`
- [x] `apps/api/src/auth/queries/login.handler.ts` (GetUserByEmailQuery → bcrypt.compare → JwtService.sign)
- [x] `apps/api/src/auth/guards/jwt.strategy.ts` (PassportStrategy, валидирует Bearer)
- [x] `apps/api/src/auth/guards/jwt.guard.ts` (extends AuthGuard('jwt'))
- [x] `apps/api/src/auth/auth.controller.ts` (POST /auth/register, POST /auth/login)
- [x] `apps/api/src/auth/auth.module.ts` (CqrsModule, UserModule, JwtModule, PassportModule)

### Сборка
- [x] Подключить `PrismaModule`, `UserModule`, `AuthModule` в `apps/api/src/app.module.ts`

### Проверка
- [x] `npm run typecheck -w apps/api` — без ошибок
- [x] `npm run dev:api` — сервер стартует
- [x] `POST /auth/register` → `{ accessToken }`
- [x] `POST /auth/login` → `{ accessToken }`
- [x] Повторный register с тем же email → 409 Conflict
- [x] Неверный пароль при login → 401 Unauthorized

## Поток данных (CQRS-шина)

```
AuthController
  POST /auth/register
    → CommandBus.execute(RegisterCommand)
        → RegisterHandler: bcrypt.hash → CommandBus.execute(CreateUserCommand)
            → CreateUserHandler: prisma.user.create
        → JwtService.sign → { accessToken }

  POST /auth/login
    → QueryBus.execute(LoginQuery)
        → LoginHandler: QueryBus.execute(GetUserByEmailQuery)
            → GetUserByEmailHandler: prisma.user.findUnique
        → bcrypt.compare → JwtService.sign → { accessToken }
```
