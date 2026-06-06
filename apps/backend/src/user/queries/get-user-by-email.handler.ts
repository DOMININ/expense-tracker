import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByEmailQuery } from "./get-user-by-email.query";

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserByEmailQuery) {
    return this.prisma.user.findUnique({ where: { email: query.email } });
  }
}
