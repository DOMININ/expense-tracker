import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetUserByIdQuery } from "../../user/queries/get-user-by-id.query";
import { CreateCategoryCommand } from "./create-category.command";

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateCategoryCommand) {
    const user = await this.queryBus.execute(
      new GetUserByIdQuery(command.userId),
    );
    if (!user) throw new UnauthorizedException();

    try {
      return await this.prisma.category.create({
        data: {
          userId: command.userId,
          name: command.name,
          color: command.color,
          icon: command.icon,
        },
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        throw new ConflictException("Категория с таким именем уже существует");
      }
      throw err;
    }
  }
}
