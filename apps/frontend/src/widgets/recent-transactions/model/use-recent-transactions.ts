"use client";

import { useEffect, useState } from "react";
import {
  getTransactionsPage,
  type TransactionsPage,
} from "@/entities/transaction";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";

const LIMIT = 10;

interface RecentTransactionsState {
  data: TransactionsPage | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useRecentTransactions(): RecentTransactionsState {
  const handleUnauthorized = useUnauthorizedHandler();
  const [data, setData] = useState<TransactionsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => {
    setPage(1);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getTransactionsPage(sessionModel.getToken(), { page, limit: LIMIT })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((e) => {
        if (!active) return;
        if (handleUnauthorized(e)) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить транзакции",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey, handleUnauthorized]);

  return { data, loading, error, page, setPage, refetch };
}
