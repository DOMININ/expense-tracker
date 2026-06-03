"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/api/client";
import { sessionModel } from "./index";

/**
 * Возвращает обработчик ошибок API: при 401 чистит токен и уводит на /login.
 * Вернёт true, если ошибка была 401 и обработана — вызывающий код может
 * сделать ранний return и не показывать собственное сообщение об ошибке.
 */
export function useUnauthorizedHandler(): (error: unknown) => boolean {
  const router = useRouter();

  return useCallback(
    (error: unknown): boolean => {
      if (error instanceof ApiError && error.status === 401) {
        sessionModel.clearToken();
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );
}
