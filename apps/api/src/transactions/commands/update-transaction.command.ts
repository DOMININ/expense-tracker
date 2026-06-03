import { TransactionType } from "@expence-tracker/shared";

export interface UpdateTransactionData {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: string;
  categoryId?: string;
}

export class UpdateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
    public readonly data: UpdateTransactionData,
  ) {}
}
