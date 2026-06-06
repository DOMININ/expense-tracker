/**
 * Запрос пользователя по ID. Обрабатывается {@link GetUserByIdHandler};
 * используется для `GET /auth/me` и для проверки существования пользователя
 * в хендлерах создания категорий/транзакций.
 */
export class GetUserByIdQuery {
  /**
   * @param userId ID искомого пользователя.
   */
  constructor(public readonly userId: string) {}
}
