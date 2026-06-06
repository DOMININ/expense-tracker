export class UpdateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
    public readonly data: { name?: string; color?: string; icon?: string },
  ) {}
}
