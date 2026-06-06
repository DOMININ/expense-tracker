/**
 * Команда удаления категории. Обрабатывается {@link DeleteCategoryHandler}.
 */
export class DeleteCategoryCommand {
  /**
   * @param userId ID владельца категории (из JWT) — для проверки доступа.
   * @param categoryId ID удаляемой категории.
   */
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
  ) {}
}
