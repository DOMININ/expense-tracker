/**
 * Запрос пользователя по email. Обрабатывается {@link GetUserByEmailHandler};
 * используется при входе для проверки учётных данных.
 */
export class GetUserByEmailQuery {
  /**
   * @param email Email искомого пользователя.
   */
  constructor(public readonly email: string) {}
}
