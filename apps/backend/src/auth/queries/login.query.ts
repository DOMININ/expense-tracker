/**
 * Запрос входа пользователя. Обрабатывается {@link LoginHandler}.
 *
 * Хотя вход не меняет состояние и оформлен как query, он возвращает новый JWT.
 */
export class LoginQuery {
  /**
   * @param email Email пользователя.
   * @param password Пароль в открытом виде.
   */
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
