/**
 * Команда создания пользователя. Обрабатывается {@link CreateUserHandler}.
 * Получает уже захешированный пароль — хеширование выполняется выше, в
 * `RegisterHandler`.
 */
export class CreateUserCommand {
  /**
   * @param name Имя пользователя.
   * @param email Email (уникальный).
   * @param passwordHash Bcrypt-хеш пароля (не сам пароль).
   */
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
  ) {}
}
