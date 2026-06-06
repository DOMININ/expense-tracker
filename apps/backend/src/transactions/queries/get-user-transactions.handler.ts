import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import type { Prisma } from "@expence-tracker/db";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  TransactionType,
  type TransactionResponseDto,
  type TransactionsListResponseDto,
} from "@expence-tracker/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserTransactionsQuery } from "./get-user-transactions.query";

/**
 * Обработчик {@link GetUserTransactionsQuery}: возвращает постранично список
 * транзакций пользователя с опциональным фильтром по месяцу и сводкой по
 * доходам/расходам/балансу.
 */
@QueryHandler(GetUserTransactionsQuery)
export class GetUserTransactionsHandler
  implements IQueryHandler<GetUserTransactionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает страницу транзакций пользователя вместе со сводкой.
   *
   * Параллельно выполняет три запроса: выборку страницы (сортировка по дате
   * убыв., с категориями), общий счётчик и агрегацию сумм по типу операции
   * (`groupBy` + `_sum`). Фильтр по дате применяется только если переданы
   * оба параметра — `month` и `year` (диапазон считается в UTC).
   * Все `Decimal`-суммы приводятся к `number`.
   *
   * @param query Параметры выборки: пользователь, фильтр по месяцу и пагинация.
   * @returns Список транзакций, сводка (`income`/`expense`/`balance`) и метаданные пагинации (`page`, `limit`, `total`, `totalPages`).
   */
  async execute(
    query: GetUserTransactionsQuery,
  ): Promise<TransactionsListResponseDto> {
    const page = Number(query.page) || DEFAULT_PAGE;
    const limit = Number(query.limit) || DEFAULT_LIMIT;
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
      items: items.map(
        (t): TransactionResponseDto => ({
          id: t.id,
          amount: t.amount.toNumber(),
          type: t.type as TransactionType,
          description: t.description,
          date: t.date,
          categoryId: t.categoryId,
          category: {
            id: t.category.id,
            name: t.category.name,
            color: t.category.color,
            icon: t.category.icon,
          },
          userId: t.userId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }),
      ),
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
