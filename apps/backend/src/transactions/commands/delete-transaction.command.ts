export class DeleteTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}
