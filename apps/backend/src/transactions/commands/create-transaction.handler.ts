import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByIdQuery } from "../../user/queries/get-user-by-id.query";
import { CreateTransactionCommand } from "./create-transaction.command";

/**
 * Обработчик {@link CreateTransactionCommand}: создаёт транзакцию пользователя,
 * предварительно проверяя существование пользователя и принадлежность категории.
 */
@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию для пользователя.
   *
   * Проверяет, что пользователь существует и что указанная категория
   * принадлежит ему, после чего сохраняет запись в БД. Поле `amount`
   * Prisma возвращает как `Decimal`, поэтому перед возвратом оно приводится
   * к `number` через `.toNumber()`.
   *
   * @param command Данные создаваемой транзакции.
   * @returns Созданная транзакция с `amount` в виде `number`.
   * @throws {UnauthorizedException} Если пользователь из команды не найден.
   * @throws {NotFoundException} Если категория не найдена или принадлежит другому пользователю.
   */
  async execute(command: CreateTransactionCommand) {
    const user = await this.queryBus.execute(
      new GetUserByIdQuery(command.userId),
    );
    if (!user) throw new UnauthorizedException();

    const category = await this.prisma.category.findUnique({
      where: { id: command.categoryId },
      select: { userId: true },
    });
    if (!category || category.userId !== command.userId) {
      throw new NotFoundException("Категория не найдена");
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: command.userId,
        categoryId: command.categoryId,
        amount: command.amount,
        type: command.type,
        description: command.description,
        date: new Date(command.date),
      },
    });

    return { ...transaction, amount: transaction.amount.toNumber() };
  }
}
