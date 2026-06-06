import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateCategoryCommand } from "./update-category.command";

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCategoryCommand) {
    const existing = await this.prisma.category.findUnique({
      where: { id: command.categoryId },
    });

    if (!existing || existing.userId !== command.userId) {
      throw new NotFoundException("Категория не найдена");
    }

    try {
      return await this.prisma.category.update({
        where: { id: command.categoryId },
        data: command.data,
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
