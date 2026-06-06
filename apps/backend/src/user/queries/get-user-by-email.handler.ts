import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByEmailQuery } from "./get-user-by-email.query";

/**
 * Обработчик {@link GetUserByEmailQuery}: ищет пользователя по email.
 */
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает пользователя по email.
   *
   * @param query Email искомого пользователя.
   * @returns Запись пользователя или `null`, если не найден.
   */
  async execute(query: GetUserByEmailQuery) {
    return this.prisma.user.findUnique({ where: { email: query.email } });
  }
}
