import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteTransactionCommand } from "./delete-transaction.command";

/**
 * Обработчик {@link DeleteTransactionCommand}: удаляет транзакцию пользователя
 * после проверки её принадлежности.
 */
@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler
  implements ICommandHandler<DeleteTransactionCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Удаляет транзакцию пользователя.
   *
   * Проверяет, что транзакция существует и принадлежит пользователю, после
   * чего удаляет запись.
   *
   * @param command ID пользователя и ID удаляемой транзакции.
   * @returns Промис без значения (`void`); маршрут отвечает `204 No Content`.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(command: DeleteTransactionCommand): Promise<void> {
    const existing = await this.prisma.transaction.findUnique({
      where: { id: command.transactionId },
    });

    if (!existing || existing.userId !== command.userId) {
      throw new NotFoundException("Транзакция не найдена");
    }

    await this.prisma.transaction.delete({
      where: { id: command.transactionId },
    });
  }
}
