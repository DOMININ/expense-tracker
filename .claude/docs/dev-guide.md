# Гайд разработчика

Пошаговые рецепты: добавить backend-модуль/эндпоинт, frontend-фичу и миграцию БД.
Контекст по устройству — в [`architecture.md`](architecture.md), контракт API —
[`api.md`](api.md), схема — [`database.md`](database.md).

## Перед началом

```bash
npm install                  # бутстрап воркспейсов
docker compose up -d         # PostgreSQL на :5432
# .env, apps/backend/.env, apps/frontend/.env.local — скопировать из *.example
npm run prisma:migrate       # применить миграции
npm run prisma:generate      # сгенерировать клиент

npm run dev:backend          # Nest watch → :3001 (Swagger на /docs)
npm run dev:frontend         # Next.js → :3000
```

Заведите ветку от `main` (`<type>/<short-slug>`, см. CLAUDE.md), один кусок работы
на ветку, влитие через squash-PR. Тест-раннер не подключён — не утверждайте, что
тесты прошли, не добавив их. Проверяйте через `npm run typecheck -w <workspace>`.

---

## Рецепт 1. Добавить эндпоинт в существующий backend-модуль

Backend на CQRS: тонкий контроллер диспетчеризует команды (мутации) и запросы
(чтение) через шины; логика — в хендлерах; к Prisma ходят только хендлеры. Пример
ниже — добавление команды; запрос делается симметрично (`queries/`, `@QueryHandler`,
`IQueryHandler`, `QueryBus`).

**1. DTO в `@expence-tracker/shared`** (если нужен новый вход/выход). В
`packages/shared/src/index.ts` добавьте класс с декораторами class-validator:

```ts
export class CreateThingDto {
  @IsString() @IsNotEmpty() @MaxLength(50)
  name!: string;
}
```

**2. Команда** — `commands/create-thing.command.ts`, plain-класс с readonly-полями.
Первым полем обычно `userId` для изоляции владельца:

```ts
export class CreateThingCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}
```

**3. Хендлер** — `commands/create-thing.handler.ts`:

```ts
@CommandHandler(CreateThingCommand)
export class CreateThingHandler implements ICommandHandler<CreateThingCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateThingCommand) {
    // изоляция владельца: всегда скоупить на userId
    // маппинг ошибок Prisma: P2002 → ConflictException, и т.п.
    return this.prisma.thing.create({
      data: { userId: command.userId, name: command.name },
    });
  }
}
```

Хендлер может звать другие хендлеры через `CommandBus`/`QueryBus` (как
`CreateTransactionHandler` проверяет пользователя через `GetUserByIdQuery`).

**4. Регистрация в модуле** — добавьте хендлер в `providers` (`*.module.ts`). Если
нужен `QueryBus`/`CommandBus`, убедитесь, что `CqrsModule` в `imports`; для
пользовательских запросов импортируйте `UserModule`.

**5. Маршрут в контроллере** — тонкий метод, валидация DTO + диспетч:

```ts
@Post()
@ApiOperation({ summary: "Создать thing" })
@ApiResponse({ status: 201, type: ThingResponseDto })
create(@Body() dto: CreateThingDto, @CurrentUser() user: CurrentUserPayload) {
  return this.commandBus.execute(new CreateThingCommand(user.userId, dto.name));
}
```

JWT-маршруты закрывайте `@UseGuards(JwtAuthGuard)` (на классе или методе), берите
пользователя через `@CurrentUser()`, не из сырого запроса.

**6. Документация (обязательно).**
- Swagger-декораторы на маршруте и DTO (`@ApiTags`, `@ApiOperation`,
  `@ApiResponse`, `@ApiBearerAuth` на JWT-роутах). `/docs` — источник истины.
- JSDoc на методе/хендлере (`@param`, `@returns`, `@throws`) — по-русски, про
  «почему».
- Обновите [`api.md`](api.md), таблицу в `apps/backend/CLAUDE.md` и при изменении
  поверхности API — `README.md`.

**7. Проверка:** `npm run typecheck -w apps/backend`, прогон через Swagger `/docs`.

### Добавить целый новый модуль
Создайте `src/<feature>/` с `<feature>.module.ts` (`imports: [CqrsModule, ...]`,
`controllers`, `providers`), контроллером и папками `commands/` + `queries/`.
Зарегистрируйте модуль в `app.module.ts`. Дальше — как в рецепте 1.

---

## Рецепт 2. Добавить frontend-фичу (FSD)

Импорты идут только вниз: `app → widgets → features → entities → shared`. Решите,
какой это слой: **feature** — действие пользователя, **widget** — композитный блок,
**entity** — доменная сущность.

**1. Создайте слайс** `src/features/<name>/` с сегментами:

```
features/<name>/
├── api/      # сетевые вызовы (через shared/api client)
├── model/    # хуки, логика
├── ui/       # компоненты
└── index.ts  # ПУБЛИЧНЫЙ barrel — единственная точка импорта извне
```

**2. Сеть — только через клиент.** В `api/` используйте `apiGet`/`apiPost` из
`@/shared/api`, не сырой `fetch`. DTO берите из `@expence-tracker/shared`:

```ts
import { apiPost } from "@/shared/api";
import type { CreateCategoryDto, CategoryResponseDto } from "@expence-tracker/shared";

export const createCategory = (dto: CreateCategoryDto) =>
  apiPost<CategoryResponseDto>("/categories", dto);
```

**3. UI.** Формы — react-hook-form + Zod + примитивы `Form` из `@/shared/ui`.
Текст — на русском. Новые shadcn-компоненты:
`cd apps/frontend && npx shadcn@latest add <component>` (попадают в `shared/ui`).

**4. Публичный API.** Экспортируйте наружу только нужное из `index.ts`. Другие
слайсы импортируют `@/features/<name>`, **не** глубокий путь.

**5. Подключение.** Используйте фичу в `widgets/*` или на странице `app/*`. Помните
правила слоёв: feature не импортирует другие features/widgets/app.

**6. Проверка:** `npm run lint -w apps/frontend`,
`npm run typecheck -w apps/frontend` (помните про `noUncheckedIndexedAccess`).

---

## Рецепт 3. Изменить схему БД и сделать миграцию

Схема — `packages/db/prisma/schema.prisma`.

**1. Правьте схему** — модель/поле/enum/индекс. Для денег — `Decimal @db.Decimal(p,s)`,
не float. Добавляйте индексы под реальные выборки (часто `@@index([userId, ...])`)
и `@@unique` для бизнес-ограничений. Решите политику `onDelete` (`Cascade` от
владельца, `Restrict` где ссылку нельзя осиротить).

**2. Создайте миграцию:**

```bash
npm run prisma:migrate -- --name <short_snake_name>
```

Это создаст папку в `packages/db/prisma/migrations/`, применит SQL к локальной БД
и регенерирует клиент.

**3. Перегенерируйте клиент** (если меняли вне migrate):

```bash
npm run prisma:generate
```

**4. Используйте новые типы.** В хендлерах типы (`Prisma`, enum'ы) импортируйте из
`@expence-tracker/db`. Для `Decimal`-полей зовите `.toNumber()` перед отдачей в DTO;
суммы агрегируйте `groupBy + _sum`.

**5. Синхронизируйте контракт.** Если поле уходит в API — обновите DTO в
`@expence-tracker/shared`, хендлеры-мапперы, Swagger, [`database.md`](database.md),
[`api.md`](api.md) и при необходимости `README.md`.

**6. Проверка:** `npm run prisma:studio` для просмотра данных,
`npm run typecheck -w apps/backend`.

> Breaking-изменение схемы: коммит с `!` и футером `BREAKING CHANGE:` (см. CLAUDE.md);
> в PR в разделе Notes укажите необходимость прогнать миграцию.

---

## Чеклист перед PR

- [ ] Ветка `<type>/<slug>` от `main`, один кусок работы.
- [ ] Коммиты — Conventional Commits, англ., imperative, ≤ 72 символов.
- [ ] `npm run typecheck -w <workspace>` зелёный (бэк и/или фронт).
- [ ] `npm run lint -w apps/frontend` — при изменениях фронта.
- [ ] DTO/Swagger/JSDoc обновлены вместе с кодом.
- [ ] README и эти документы (`.claude/docs/*`) отражают новую реальность.
- [ ] Пользовательская копия — на русском; код/идентификаторы — на английском.
- [ ] Test plan в описании PR (см. CLAUDE.md).
