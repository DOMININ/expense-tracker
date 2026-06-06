/**
 * Запрос списка транзакций пользователя с фильтром по месяцу, пагинацией и
 * сводкой. Обрабатывается {@link GetUserTransactionsHandler} через `QueryBus`.
 */
export class GetUserTransactionsQuery {
  /**
   * @param userId ID пользователя (из JWT) — ограничивает выборку его транзакциями.
   * @param month Месяц фильтра (1–12). Применяется только вместе с `year`.
   * @param year Год фильтра. Применяется только вместе с `month`.
   * @param page Номер страницы (по умолчанию `DEFAULT_PAGE`).
   * @param limit Размер страницы (по умолчанию `DEFAULT_LIMIT`).
   */
  constructor(
    public readonly userId: string,
    public readonly month?: number,
    public readonly year?: number,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
