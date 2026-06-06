import { TransactionType } from "@expence-tracker/shared";

export class CreateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly description: string,
    public readonly date: string,
    public readonly categoryId: string,
  ) {}
}
