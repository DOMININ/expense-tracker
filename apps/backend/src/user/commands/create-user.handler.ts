import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserCommand } from "./create-user.command";

/**
 * Обработчик {@link CreateUserCommand}: создаёт пользователя, предварительно
 * проверяя уникальность email.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт нового пользователя.
   *
   * @param command Имя, email и хеш пароля.
   * @returns Созданная запись пользователя.
   * @throws {ConflictException} Если пользователь с таким email уже существует.
   */
  async execute(command: CreateUserCommand) {
    const exists = await this.prisma.user.findUnique({
      where: { email: command.email },
    });
    if (exists) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }
    return this.prisma.user.create({
      data: {
        name: command.name,
        email: command.email,
        passwordHash: command.passwordHash,
      },
    });
  }
}
