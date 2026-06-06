import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserCategoriesQuery } from "./get-user-categories.query";

/**
 * Обработчик {@link GetUserCategoriesQuery}: возвращает категории пользователя.
 */
@QueryHandler(GetUserCategoriesQuery)
export class GetUserCategoriesHandler
  implements IQueryHandler<GetUserCategoriesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает все категории пользователя.
   *
   * @param query ID пользователя.
   * @returns Категории пользователя, отсортированные по дате создания (по возрастанию).
   */
  async execute(query: GetUserCategoriesQuery) {
    return this.prisma.category.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: "asc" },
    });
  }
}
