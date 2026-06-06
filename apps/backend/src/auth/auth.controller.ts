import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RegisterCommand } from "./commands/register.command";
import { LoginQuery } from "./queries/login.query";
import { GetUserByIdQuery } from "../user/queries/get-user-by-id.query";
import { JwtAuthGuard } from "./guards/jwt.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "./decorators/current-user.decorator";
import { LoginDto, RegisterDto, UserResponseDto } from "@expence-tracker/shared";

/**
 * REST-контроллер аутентификации (`/auth`). Регистрация и вход открыты,
 * `GET /auth/me` защищён {@link JwtAuthGuard}. Контроллер тонкий — валидирует
 * DTO и диспетчеризует команды/запросы через шины.
 */
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * `POST /auth/register` — регистрирует пользователя и выдаёт JWT.
   *
   * @param dto Тело запроса: имя, email, пароль.
   * @returns Объект с токеном доступа `{ accessToken }`.
   * @throws {ConflictException} Если пользователь с таким email уже существует.
   */
  @Post("register")
  @ApiOperation({ summary: "Регистрация пользователя, выдаёт JWT" })
  @ApiResponse({
    status: 201,
    description: "Пользователь создан, возвращён токен доступа",
    schema: { properties: { accessToken: { type: "string" } } },
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 409, description: "Email уже занят" })
  register(@Body() dto: RegisterDto): Promise<{ accessToken: string }> {
    return this.commandBus.execute(
      new RegisterCommand(dto.name, dto.email, dto.password),
    );
  }

  /**
   * `POST /auth/login` — проверяет учётные данные и выдаёт JWT.
   *
   * @param dto Тело запроса: email и пароль.
   * @returns Объект с токеном доступа `{ accessToken }`.
   * @throws {UnauthorizedException} Если email не найден или пароль неверный.
   */
  @Post("login")
  @ApiOperation({ summary: "Вход по email и паролю, выдаёт JWT" })
  @ApiResponse({
    status: 201,
    description: "Учётные данные верны, возвращён токен доступа",
    schema: { properties: { accessToken: { type: "string" } } },
  })
  @ApiResponse({ status: 400, description: "Ошибка валидации тела запроса" })
  @ApiResponse({ status: 401, description: "Неверный email или пароль" })
  login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.queryBus.execute(new LoginQuery(dto.email, dto.password));
  }

  /**
   * `GET /auth/me` — возвращает профиль текущего пользователя по JWT.
   *
   * @param user Текущий пользователь из токена.
   * @returns Профиль пользователя (`id`, `name`, `email`).
   * @throws {UnauthorizedException} Если токен отсутствует/невалиден или пользователь не найден.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Профиль текущего пользователя по JWT" })
  @ApiResponse({
    status: 200,
    description: "Профиль текущего пользователя",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Токен отсутствует или невалиден" })
  async me(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    const u = await this.queryBus.execute<
      GetUserByIdQuery,
      UserResponseDto | null
    >(new GetUserByIdQuery(user.userId));
    if (!u) throw new UnauthorizedException();
    return { id: u.id, name: u.name, email: u.email };
  }
}
