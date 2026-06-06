import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteCategoryCommand } from "./delete-category.command";

/**
 * Обработчик {@link DeleteCategoryCommand}: удаляет категорию пользователя,
 * если она ему принадлежит и не используется транзакциями.
 */
@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Удаляет категорию пользователя.
   *
   * Проверяет принадлежность категории. Нарушение внешнего ключа (`P2003`) —
   * признак того, что на категорию ссылаются транзакции (relation
   * `onDelete: Restrict`); транслируется в `ConflictException`.
   *
   * @param command ID пользователя и ID удаляемой категории.
   * @returns Промис без значения; маршрут отвечает `204 No Content`.
   * @throws {NotFoundException} Если категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} Если категория используется транзакциями.
   */
  async execute(command: DeleteCategoryCommand): Promise<void> {
    const existing = await this.prisma.category.findUnique({
      where: { id: command.categoryId },
    });

    if (!existing || existing.userId !== command.userId) {
      throw new NotFoundException("Категория не найдена");
    }

    try {
      await this.prisma.category.delete({ where: { id: command.categoryId } });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2003"
      ) {
        throw new ConflictException(
          "Нельзя удалить категорию с транзакциями",
        );
      }
      throw err;
    }
  }
}
