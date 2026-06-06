import { apiGet } from "@/shared/api/client";
import type { TransactionsPage } from "../model/types";

interface GetTransactionsParams {
  page: number;
  limit: number;
}

export function getTransactionsPage(
  token: string | null,
  { page, limit }: GetTransactionsParams,
): Promise<TransactionsPage> {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiGet<TransactionsPage>(`/transactions?${search.toString()}`, token);
}
