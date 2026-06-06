import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@expence-tracker/shared";
import { CreateCategoryCommand } from "./commands/create-category.command";
import { UpdateCategoryCommand } from "./commands/update-category.command";
import { DeleteCategoryCommand } from "./commands/delete-category.command";
import { GetUserCategoriesQuery } from "./queries/get-user-categories.query";

/**
 * REST-контроллер категорий (`/categories`). Все маршруты защищены
 * {@link JwtAuthGuard}: пользователь берётся из токена через `@CurrentUser()`.
 * Контроллер тонкий — валидирует DTO и диспетчеризует команды/запросы через шины.
 */
@ApiTags("categories")
@ApiBearerAuth()
@ApiResponse({ status: 401, description: "Токен отсутствует или невалиден" })
@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * `POST /categories` — создаёт категорию для текущего пользователя.
   *
   * @param dto Тело запроса: имя, цвет (hex), иконка.
   * @param user Текущий пользователь из JWT.
   * @returns Созданная категория.
   * @throws {UnauthorizedException} Если токен отсутствует/невалиден или пользователь не найден.
   * @throws {ConflictException} Если у пользователя уже есть категория с таким именем.
   */
  @Post()
  @ApiOperation({ summary: "Создать категорию текущего пользователя" })
  @ApiResponse({
    status: 201,
    description: "Категория создана",
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 409, description: "Категория с таким именем уже существует" })
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new CreateCategoryCommand(user.userId, dto.name, dto.color, dto.icon),
    );
  }

  /**
   * `GET /categories` — список категорий текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @returns Категории пользователя, отсортированные по дате создания (возр.).
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   */
  @Get()
  @ApiOperation({ summary: "Список категорий текущего пользователя" })
  @ApiResponse({
    status: 200,
    description: "Категории пользователя (сортировка по дате создания)",
    type: CategoryResponseDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(new GetUserCategoriesQuery(user.userId));
  }

  /**
   * `PATCH /categories/:id` — частично обновляет категорию текущего пользователя.
   *
   * @param id ID обновляемой категории.
   * @param dto Тело запроса с изменяемыми полями (обновляются только переданные).
   * @param user Текущий пользователь из JWT.
   * @returns Обновлённая категория.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   * @throws {NotFoundException} Если категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} Если новое имя конфликтует с другой категорией пользователя.
   */
  @Patch(":id")
  @ApiOperation({ summary: "Обновить категорию (частично)" })
  @ApiResponse({
    status: 200,
    description: "Обновлённая категория",
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 404, description: "Категория не найдена" })
  @ApiResponse({ status: 409, description: "Категория с таким именем уже существует" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(user.userId, id, dto),
    );
  }

  /**
   * `DELETE /categories/:id` — удаляет категорию текущего пользователя.
   *
   * @param id ID удаляемой категории.
   * @param user Текущий пользователь из JWT.
   * @returns Промис без значения; маршрут отвечает `204 No Content`.
   * @throws {UnauthorizedException} Если токен отсутствует или невалиден.
   * @throws {NotFoundException} Если категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} Если категория используется транзакциями (удаление запрещено).
   */
  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить категорию" })
  @ApiResponse({ status: 204, description: "Категория удалена" })
  @ApiResponse({ status: 404, description: "Категория не найдена" })
  @ApiResponse({ status: 409, description: "Нельзя удалить категорию с транзакциями" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.commandBus.execute(
      new DeleteCategoryCommand(user.userId, id),
    );
  }
}
