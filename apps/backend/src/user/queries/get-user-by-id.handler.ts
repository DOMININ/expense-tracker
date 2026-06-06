import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByIdQuery } from "./get-user-by-id.query";

/**
 * Обработчик {@link GetUserByIdQuery}: ищет пользователя по ID.
 */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает пользователя по ID.
   *
   * @param query ID искомого пользователя.
   * @returns Запись пользователя или `null`, если не найден.
   */
  async execute(query: GetUserByIdQuery) {
    return this.prisma.user.findUnique({ where: { id: query.userId } });
  }
}
