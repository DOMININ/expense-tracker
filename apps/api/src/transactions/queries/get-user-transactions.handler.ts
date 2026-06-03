import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserTransactionsQuery } from "./get-user-transactions.query";

@QueryHandler(GetUserTransactionsQuery)
export class GetUserTransactionsHandler
  implements IQueryHandler<GetUserTransactionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserTransactionsQuery) {
    const now = new Date();
    const month = query.month ?? now.getUTCMonth() + 1;
    const year = query.year ?? now.getUTCFullYear();

    const gte = new Date(Date.UTC(year, month - 1, 1));
    const lt = new Date(Date.UTC(year, month, 1));

    const where = {
      userId: query.userId,
      date: { gte, lt },
    };

    const [items, grouped] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
      }),
      this.prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
    ]);

    const income =
      grouped.find((g) => g.type === "INCOME")?._sum.amount?.toNumber() ?? 0;
    const expense =
      grouped.find((g) => g.type === "EXPENSE")?._sum.amount?.toNumber() ?? 0;

    return {
      items: items.map((t) => ({ ...t, amount: t.amount.toNumber() })),
      totals: {
        income,
        expense,
        balance: income - expense,
      },
    };
  }
}
