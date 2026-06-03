import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByIdQuery } from "./get-user-by-id.query";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserByIdQuery) {
    return this.prisma.user.findUnique({ where: { id: query.userId } });
  }
}
