import { TransactionType } from "@expence-tracker/shared";

/**
 * Набор изменяемых полей транзакции. Все поля необязательны — обновляются
 * только переданные (partial update).
 */
export interface UpdateTransactionData {
  /** Новая сумма операции. */
  amount?: number;
  /** Новый тип операции (`INCOME`/`EXPENSE`). */
  type?: TransactionType;
  /** Новое описание операции. */
  description?: string;
  /** Новая дата операции в формате ISO-8601. */
  date?: string;
  /** ID новой категории. */
  categoryId?: string;
}

/**
 * Команда обновления транзакции. Передаётся в {@link UpdateTransactionHandler}
 * через `CommandBus`.
 */
export class UpdateTransactionCommand {
  /**
   * @param userId ID владельца транзакции (из JWT) — используется для проверки доступа.
   * @param transactionId ID обновляемой транзакции.
   * @param data Изменяемые поля; применяются только заданные значения.
   */
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
    public readonly data: UpdateTransactionData,
  ) {}
}
