"use client";

import { useSyncExternalStore } from "react";

// Лёгкий общий сигнал «транзакции изменились»: позволяет виджетам баланса,
// статистики и списка перезагрузиться после создания операции из любого места,
// не вводя глобальный стор данных.
let version = 0;
const listeners = new Set<() => void>();

export const transactionsRefresh = {
  /** Сообщить всем подписчикам, что данные транзакций устарели. */
  bump() {
    version += 1;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getVersion() {
    return version;
  },
};

/** Версия сигнала; меняется при каждом `bump()` — кладите в зависимости эффекта. */
export function useTransactionsRefreshVersion(): number {
  return useSyncExternalStore(
    transactionsRefresh.subscribe,
    transactionsRefresh.getVersion,
    () => 0,
  );
}
