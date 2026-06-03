import { IQueryHandler, QueryHandler, QueryBus } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginQuery } from "./login.query";
import { GetUserByEmailQuery } from "../../user/queries/get-user-by-email.query";

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

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
