import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../auth/decorators/current-user.decorator";
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  TransactionResponseDto,
  TransactionsListResponseDto,
  UpdateTransactionDto,
} from "@expence-tracker/shared";
import { CreateTransactionCommand } from "./commands/create-transaction.command";
import { UpdateTransactionCommand } from "./commands/update-transaction.command";
import { DeleteTransactionCommand } from "./commands/delete-transaction.command";
import { GetUserTransactionsQuery } from "./queries/get-user-transactions.query";
import { GetTransactionByIdQuery } from "./queries/get-transaction-by-id.query";

/**
 * REST-контроллер транзакций (`/transactions`). Все маршруты защищены
 * {@link JwtAuthGuard}: текущий пользователь берётся из токена через
 * `@CurrentUser()`. Контроллер тонкий — только валидирует DTO и диспетчеризует
 * команды/запросы через `CommandBus`/`QueryBus`, не обращаясь к БД напрямую.
 */
@ApiTags("transactions")
@ApiBearerAuth()
@ApiResponse({ status: 401, description: "Токен отсутствует или невалиден" })
@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * `POST /transactions` — создаёт транзакцию для текущего пользователя.
   *
   * @param dto Тело запроса с данными транзакции (сумма, тип, описание, дата, категория).
   * @param user Текущий пользователь из JWT.
   * @returns Созданная транзакция с `amount` в виде `number`.
   * @throws {UnauthorizedException} Если токен отсутствует/невалиден или пользователь не найден.
   * @throws {NotFoundException} Если категория не найдена или принадлежит другому пользователю.
   */
  @Post()
  @ApiOperation({ summary: "Создать транзакцию текущего пользователя" })
  @ApiResponse({
    status: 201,
    description: "Транзакция создана",
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 404, description: "Категория не найдена" })
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        user.userId,
        dto.amount,
        dto.type,
        dto.description,
        dto.date,
        dto.categoryId,
      ),
    );
  }

  /**
   * `GET /transactions` — список транзакций текущего пользователя со сводкой.
   *
   * @param query Параметры запроса: `month`+`year` (всё-или-ничего), `page`, `limit`.
   * @param user Текущий пользователь из JWT.
   * @returns Страница транзакций, сводка (доход/расход/баланс) и метаданные пагинации.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   */
  @Get()
  @ApiOperation({
    summary: "Список транзакций текущего пользователя со сводкой",
  })
  @ApiResponse({
    status: 200,
    description: "Страница транзакций, сводка и метаданные пагинации",
    type: TransactionsListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Некорректные параметры запроса (например, задан только month без year)",
  })
  findAll(
    @Query() query: ListTransactionsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.queryBus.execute(
      new GetUserTransactionsQuery(
        user.userId,
        query.month,
        query.year,
        query.page,
        query.limit,
      ),
    );
  }

  /**
   * `GET /transactions/:id` — одна транзакция текущего пользователя.
   *
   * @param id ID запрашиваемой транзакции.
   * @param user Текущий пользователь из JWT.
   * @returns Найденная транзакция с `amount` в виде `number`.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  @Get(":id")
  @ApiOperation({ summary: "Получить транзакцию по ID" })
  @ApiResponse({
    status: 200,
    description: "Найденная транзакция",
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Транзакция не найдена" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new GetTransactionByIdQuery(user.userId, id),
    );
  }

  /**
   * `PATCH /transactions/:id` — частично обновляет транзакцию текущего пользователя.
   *
   * @param id ID обновляемой транзакции.
   * @param dto Тело запроса с изменяемыми полями (обновляются только переданные).
   * @param user Текущий пользователь из JWT.
   * @returns Обновлённая транзакция с `amount` в виде `number`.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   * @throws {NotFoundException} Если транзакция не найдена/чужая или новая категория не найдена/чужая.
   */
  @Patch(":id")
  @ApiOperation({ summary: "Обновить транзакцию (частично)" })
  @ApiResponse({
    status: 200,
    description: "Обновлённая транзакция",
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 404, description: "Транзакция или новая категория не найдена" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new UpdateTransactionCommand(user.userId, id, dto),
    );
  }

  /**
   * `DELETE /transactions/:id` — удаляет транзакцию текущего пользователя.
   *
   * @param id ID удаляемой транзакции.
   * @param user Текущий пользователь из JWT.
   * @returns Промис без значения; маршрут отвечает `204 No Content`.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить транзакцию" })
  @ApiResponse({ status: 204, description: "Транзакция удалена" })
  @ApiResponse({ status: 404, description: "Транзакция не найдена" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.commandBus.execute(
      new DeleteTransactionCommand(user.userId, id),
    );
  }
}
