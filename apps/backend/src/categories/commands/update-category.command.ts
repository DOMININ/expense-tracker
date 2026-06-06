/**
 * Команда обновления категории. Обрабатывается {@link UpdateCategoryHandler}.
 */
export class UpdateCategoryCommand {
  /**
   * @param userId ID владельца категории (из JWT) — для проверки доступа.
   * @param categoryId ID обновляемой категории.
   * @param data Изменяемые поля (`name`/`color`/`icon`); применяются только переданные.
   */
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
    public readonly data: { name?: string; color?: string; icon?: string },
  ) {}
}
