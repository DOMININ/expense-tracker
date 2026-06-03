export class DeleteCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
  ) {}
}
