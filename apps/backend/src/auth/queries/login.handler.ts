import { IQueryHandler, QueryHandler, QueryBus } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginQuery } from "./login.query";
import { GetUserByEmailQuery } from "../../user/queries/get-user-by-email.query";

/**
 * Обработчик {@link LoginQuery}: проверяет email и пароль, при успехе выдаёт JWT.
 */
@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Аутентифицирует пользователя и возвращает токен доступа.
   *
   * Ищет пользователя по email через `GetUserByEmailQuery` и сверяет пароль
   * через `bcrypt.compare`. На отсутствие пользователя и на неверный пароль
   * отдаётся одинаковая ошибка — чтобы не раскрывать, существует ли email.
   *
   * @param query Email и пароль в открытом виде.
   * @returns Объект с токеном доступа `{ accessToken }`.
   * @throws {UnauthorizedException} Если email не найден или пароль неверный.
   */
  async execute(query: LoginQuery) {
    const user = await this.queryBus.execute(
      new GetUserByEmailQuery(query.email),
    );
    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }
    const valid = await bcrypt.compare(query.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Неверный email или пароль");
    }
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken };
  }
}
