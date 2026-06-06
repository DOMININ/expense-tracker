/**
 * Запрос списка категорий пользователя. Обрабатывается
 * {@link GetUserCategoriesHandler}.
 */
export class GetUserCategoriesQuery {
  /**
   * @param userId ID пользователя (из JWT) — ограничивает выборку его категориями.
   */
  constructor(public readonly userId: string) {}
}
