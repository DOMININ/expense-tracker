import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetTransactionByIdQuery } from "./get-transaction-by-id.query";

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

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
