import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteTransactionCommand } from "./delete-transaction.command";

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler
  implements ICommandHandler<DeleteTransactionCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTransactionCommand): Promise<void> {
    const existing = await this.prisma.transaction.findUnique({
      where: { id: command.transactionId },
    });

    if (!existing || existing.userId !== command.userId) {
      throw new NotFoundException("Транзакция не найдена");
    }

    await this.prisma.transaction.delete({
      where: { id: command.transactionId },
    });
  }
}
