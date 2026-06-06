import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import type { Prisma } from "@expence-tracker/db";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateTransactionCommand } from "./update-transaction.command";

/**
 * Обработчик {@link UpdateTransactionCommand}: частично обновляет транзакцию,
 * проверяя её принадлежность пользователю и (при смене категории) принадлежность
 * новой категории тому же пользователю.
 */
@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler
  implements ICommandHandler<UpdateTransactionCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Обновляет существующую транзакцию пользователя.
   *
   * Сначала проверяет, что транзакция существует и принадлежит пользователю.
   * Если меняется категория, дополнительно проверяет, что новая категория
   * принадлежит тому же пользователю. В БД пишутся только переданные поля;
   * `amount` приводится к `number` через `.toNumber()` перед возвратом.
   *
   * @param command Идентификаторы и набор изменяемых полей.
   * @returns Обновлённая транзакция с `amount` в виде `number`.
   * @throws {NotFoundException} Если транзакция не найдена/чужая, либо новая категория не найдена/чужая.
   */
  async execute(command: UpdateTransactionCommand) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id: command.transactionId },
    });

    if (!existing || existing.userId !== command.userId) {
      throw new NotFoundException("Транзакция не найдена");
    }

    const { data } = command;

    if (
      data.categoryId !== undefined &&
      data.categoryId !== existing.categoryId
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { userId: true },
      });
      if (!category || category.userId !== command.userId) {
        throw new NotFoundException("Категория не найдена");
      }
    }

    const updateData: Prisma.TransactionUpdateInput = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    const updated = await this.prisma.transaction.update({
      where: { id: command.transactionId },
      data: updateData,
    });

    return { ...updated, amount: updated.amount.toNumber() };
  }
}
