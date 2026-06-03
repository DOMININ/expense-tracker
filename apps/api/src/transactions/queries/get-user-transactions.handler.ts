import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import type { Prisma } from "@expence-tracker/db";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserTransactionsQuery } from "./get-user-transactions.query";

@QueryHandler(GetUserTransactionsQuery)
export class GetUserTransactionsHandler
  implements IQueryHandler<GetUserTransactionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserTransactionsQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId: query.userId };

    // Фильтр по месяцу применяем только если переданы оба параметра.
    if (query.month && query.year) {
      const gte = new Date(Date.UTC(query.year, query.month - 1, 1));
      const lt = new Date(Date.UTC(query.year, query.month, 1));
      where.date = { gte, lt };
    }

    const [items, total, grouped] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.transaction.count({ where }),
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
      items: items.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
        category: {
          id: t.category.id,
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
        },
      })),
      totals: {
        income,
        expense,
        balance: income - expense,
      },
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
