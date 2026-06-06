"use client";

import { useEffect, useState } from "react";
import { getCategories, type Category } from "@/entities/category";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";

interface CategoriesState {
  categories: Category[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(): CategoriesState {
  const handleUnauthorized = useUnauthorizedHandler();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCategories(sessionModel.getToken())
      .then((res) => {
        if (active) setCategories(res);
      })
      .catch((e) => {
        if (!active) return;
        if (handleUnauthorized(e)) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить категории",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, handleUnauthorized]);

  return { categories, loading, error, refetch };
}
