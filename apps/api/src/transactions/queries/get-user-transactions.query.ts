export class GetUserTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly month?: number,
    public readonly year?: number,
  ) {}
}
