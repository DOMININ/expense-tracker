"use client";

import { useEffect, useState } from "react";
import { getTransactionsPage } from "../api/get-transactions";
import type { TransactionsPage } from "./types";
import { useTransactionsRefreshVersion } from "./transactions-refresh";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";

interface TransactionsOverviewState {
  data: TransactionsPage | null;
  loading: boolean;
  error: string | null;
}

/**
 * Загружает первую страницу транзакций ради сводки (`totals`) и нескольких
 * последних операций. Используется виджетами баланса и статистики на дашборде.
 */
export function useTransactionsOverview(
  limit = 6,
): TransactionsOverviewState {
  const handleUnauthorized = useUnauthorizedHandler();
  const version = useTransactionsRefreshVersion();
  const [data, setData] = useState<TransactionsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getTransactionsPage(sessionModel.getToken(), { page: 1, limit })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((e) => {
        if (!active) return;
        if (handleUnauthorized(e)) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить данные",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit, version, handleUnauthorized]);

  return { data, loading, error };
}
