import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterCommand } from "./commands/register.command";
import { LoginQuery } from "./queries/login.query";
import { LoginDto, RegisterDto } from "@expence-tracker/shared";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<{ accessToken: string }> {
    return this.commandBus.execute(
      new RegisterCommand(dto.name, dto.email, dto.password),
    );
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.queryBus.execute(new LoginQuery(dto.email, dto.password));
  }
}
