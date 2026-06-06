import { CommandHandler, ICommandHandler, CommandBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterCommand } from "./register.command";
import { CreateUserCommand } from "../../user/commands/create-user.command";

/**
 * Обработчик {@link RegisterCommand}: хеширует пароль, создаёт пользователя
 * через `CreateUserCommand` и выдаёт подписанный JWT.
 */
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Регистрирует пользователя и возвращает токен доступа.
   *
   * Пароль хешируется bcrypt (10 раундов), затем переиспользуется логика
   * создания пользователя через `CommandBus`. JWT содержит `sub` (id) и `email`.
   *
   * @param command Имя, email и пароль в открытом виде.
   * @returns Объект с токеном доступа `{ accessToken }`.
   * @throws {ConflictException} Пробрасывается из `CreateUserCommand`, если email занят.
   */
  async execute(command: RegisterCommand) {
    const passwordHash = await bcrypt.hash(command.password, 10);
    const user = await this.commandBus.execute(
      new CreateUserCommand(command.name, command.email, passwordHash),
    );
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken };
  }
}
