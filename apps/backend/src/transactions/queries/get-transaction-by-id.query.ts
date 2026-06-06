/**
 * Запрос одной транзакции по ID. Обрабатывается {@link GetTransactionByIdHandler}
 * через `QueryBus`.
 */
export class GetTransactionByIdQuery {
  /**
   * @param userId ID пользователя (из JWT) — ограничивает выборку его транзакциями.
   * @param transactionId ID запрашиваемой транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}
