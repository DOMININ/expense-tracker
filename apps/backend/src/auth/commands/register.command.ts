/**
 * Команда регистрации пользователя. Обрабатывается {@link RegisterHandler}.
 * Получает пароль в открытом виде — хеширование делает хендлер.
 */
export class RegisterCommand {
  /**
   * @param name Имя пользователя.
   * @param email Email (уникальный).
   * @param password Пароль в открытом виде.
   */
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
