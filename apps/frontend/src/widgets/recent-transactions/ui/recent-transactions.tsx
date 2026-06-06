"use client";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { TransactionCard } from "@/entities/transaction";
import { CreateTransactionDialog } from "@/features/create-transaction";
import { useRecentTransactions } from "../model/use-recent-transactions";

export function RecentTransactions() {
  const { data, loading, error, page, setPage, refetch } =
    useRecentTransactions();

  const totalPages = data?.totalPages ?? 1;
  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Последние транзакции</CardTitle>
        <CreateTransactionDialog onCreated={refetch} />
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Загрузка…
          </p>
        )}

        {!loading && error && (
          <p className="py-6 text-center text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Транзакций пока нет
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <ul className="divide-y">
              {items.map((transaction) => (
                <li key={transaction.id}>
                  <TransactionCard transaction={transaction} />
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
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
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
