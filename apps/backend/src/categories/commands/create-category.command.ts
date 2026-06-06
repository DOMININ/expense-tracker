/**
 * Команда создания категории. Обрабатывается {@link CreateCategoryHandler}.
 */
export class CreateCategoryCommand {
  /**
   * @param userId ID владельца категории (из JWT).
   * @param name Название категории (уникально в пределах пользователя).
   * @param color Цвет категории в hex-формате.
   * @param icon Идентификатор иконки категории.
   */
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly color: string,
    public readonly icon: string,
  ) {}
}
