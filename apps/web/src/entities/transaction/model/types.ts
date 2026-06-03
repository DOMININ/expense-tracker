export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
  category: TransactionCategory;
}

export interface TransactionTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface TransactionsPage {
  items: Transaction[];
  totals: TransactionTotals;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
