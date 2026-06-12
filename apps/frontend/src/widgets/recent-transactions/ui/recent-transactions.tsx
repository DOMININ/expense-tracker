"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  TransactionCard,
  TRANSACTION_ROW_GRID,
  transactionsRefresh,
} from "@/entities/transaction";
import { CreateTransactionDialog } from "@/features/create-transaction";
import { useRecentTransactions } from "../model/use-recent-transactions";

export function RecentTransactions({ title = "Последние транзакции" }: { title?: string }) {
  const { data, loading, error, page, setPage } = useRecentTransactions();

  const totalPages = data?.totalPages ?? 1;
  const items = data?.items ?? [];

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <CreateTransactionDialog onCreated={() => transactionsRefresh.bump()} />
      </div>

      {/* Column header */}
      <div
        className={cn(
          TRANSACTION_ROW_GRID,
          "mt-5 border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
        )}
      >
        <span>Операция</span>
        <span className="hidden sm:block">Дата</span>
        <span className="hidden sm:block">Тип</span>
        <span className="text-right">Сумма</span>
      </div>

      {loading && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Загрузка…
        </p>
      )}

      {!loading && error && (
        <p className="py-10 text-center text-sm text-danger">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Транзакций пока нет
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <ul className="divide-y divide-border">
            {items.map((transaction) => (
              <li key={transaction.id}>
                <TransactionCard transaction={transaction} />
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              Назад
            </Button>
            <span className="text-sm text-muted-foreground">
              Стр. {page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Вперёд
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
