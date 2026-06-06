import { apiPost } from "@/shared/api/client";
import type { Transaction, TransactionType } from "@/entities/transaction";

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
}

export function createTransaction(
  token: string | null,
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  return apiPost<Transaction>("/transactions", payload, token);
}
