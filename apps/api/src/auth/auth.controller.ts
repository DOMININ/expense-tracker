import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterCommand } from "./commands/register.command";
import { LoginQuery } from "./queries/login.query";
import { GetUserByIdQuery } from "../user/queries/get-user-by-id.query";
import { JwtAuthGuard } from "./guards/jwt.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "./decorators/current-user.decorator";
import { LoginDto, RegisterDto, UserResponseDto } from "@expence-tracker/shared";

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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    const u = await this.queryBus.execute<
      GetUserByIdQuery,
      UserResponseDto | null
    >(new GetUserByIdQuery(user.userId));
    if (!u) throw new UnauthorizedException();
    return { id: u.id, name: u.name, email: u.email };
  }
}
