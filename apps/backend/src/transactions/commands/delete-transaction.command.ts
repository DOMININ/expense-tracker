/**
 * Команда удаления транзакции. Передаётся в {@link DeleteTransactionHandler}
 * через `CommandBus`.
 */
export class DeleteTransactionCommand {
  /**
   * @param userId ID владельца транзакции (из JWT) — используется для проверки доступа.
   * @param transactionId ID удаляемой транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}
