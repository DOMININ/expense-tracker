import { TransactionType } from "@expence-tracker/shared";

/**
 * Команда создания транзакции. Переносит данные из контроллера в
 * {@link CreateTransactionHandler} через `CommandBus`.
 */
export class CreateTransactionCommand {
  /**
   * @param userId ID владельца транзакции (берётся из JWT, не из тела запроса).
   * @param amount Сумма операции в основной валюте (положительное число).
   * @param type Тип операции: доход (`INCOME`) или расход (`EXPENSE`).
   * @param description Описание операции.
   * @param date Дата операции в виде строки ISO-8601 (приводится к `Date` в хендлере).
   * @param categoryId ID категории, к которой привязывается транзакция.
   */
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly description: string,
    public readonly date: string,
    public readonly categoryId: string,
  ) {}
}
