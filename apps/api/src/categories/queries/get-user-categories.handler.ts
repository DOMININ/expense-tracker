import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserCategoriesQuery } from "./get-user-categories.query";

@QueryHandler(GetUserCategoriesQuery)
export class GetUserCategoriesHandler
  implements IQueryHandler<GetUserCategoriesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserCategoriesQuery) {
    return this.prisma.category.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: "asc" },
    });
  }
}
