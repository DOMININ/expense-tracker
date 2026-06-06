"use client";

import { useEffect, useState } from "react";
import { getMe, type User } from "@/entities/user";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";

interface CurrentUserState {
  user: User | null;
  loading: boolean;
}

export function useCurrentUser(): CurrentUserState {
  const handleUnauthorized = useUnauthorizedHandler();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getMe(sessionModel.getToken())
      .then((u) => {
        if (active) setUser(u);
      })
      .catch((e) => {
        if (!active) return;
        // 401 уводит на /login; прочие ошибки игнорируем — шапка просто
        // не покажет имя.
        handleUnauthorized(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [handleUnauthorized]);

  return { user, loading };
}
