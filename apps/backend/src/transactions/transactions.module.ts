import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserModule } from "../user/user.module";
import { TransactionsController } from "./transactions.controller";
import { CreateTransactionHandler } from "./commands/create-transaction.handler";
import { UpdateTransactionHandler } from "./commands/update-transaction.handler";
import { DeleteTransactionHandler } from "./commands/delete-transaction.handler";
import { GetUserTransactionsHandler } from "./queries/get-user-transactions.handler";
import { GetTransactionByIdHandler } from "./queries/get-transaction-by-id.handler";

/**
 * Модуль транзакций. Регистрирует {@link TransactionsController} и CQRS-хендлеры
 * команд/запросов. Импортирует `CqrsModule` (шины команд/запросов) и `UserModule`
 * (чтобы {@link CreateTransactionHandler} мог проверять пользователя через
 * `GetUserByIdQuery`). `PrismaService` доступен глобально из `PrismaModule`.
 */
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionHandler,
    UpdateTransactionHandler,
    DeleteTransactionHandler,
    GetUserTransactionsHandler,
    GetTransactionByIdHandler,
  ],
})
export class TransactionsModule {}
