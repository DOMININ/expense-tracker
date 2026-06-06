import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetTransactionByIdQuery } from "./get-transaction-by-id.query";

/**
 * Обработчик {@link GetTransactionByIdQuery}: возвращает одну транзакцию,
 * проверяя её принадлежность пользователю.
 */
@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает транзакцию по ID, если она принадлежит пользователю.
   *
   * `amount` приводится к `number` через `.toNumber()` перед возвратом.
   *
   * @param query ID пользователя и ID запрашиваемой транзакции.
   * @returns Найденная транзакция с `amount` в виде `number`.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(query: GetTransactionByIdQuery) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: query.transactionId },
    });

    if (!transaction || transaction.userId !== query.userId) {
      throw new NotFoundException("Транзакция не найдена");
    }

    return { ...transaction, amount: transaction.amount.toNumber() };
  }
}
