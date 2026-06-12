import { cn } from "@/shared/lib/utils";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import type { Transaction } from "../model/types";

/** Shared grid template — keep in sync with the table header in RecentTransactions. */
export const TRANSACTION_ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_130px_120px_140px]";

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className={cn(TRANSACTION_ROW_GRID, "py-3")}>
      {/* Операция */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-base"
          style={{ backgroundColor: `${transaction.category.color}22` }}
          aria-hidden
        >
          {transaction.category.icon}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">
            {transaction.description}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {transaction.category.name}
          </p>
        </div>
      </div>

      {/* Дата */}
      <div className="hidden text-sm text-muted-foreground sm:block">
        {formatDate(transaction.date)}
      </div>

      {/* Тип */}
      <div className="hidden sm:block">
        <Badge variant={isIncome ? "success" : "neutral"} dot>
          {isIncome ? "Доход" : "Расход"}
        </Badge>
      </div>

      {/* Сумма */}
      <div
        className={cn(
          "text-right font-semibold tabular-nums",
          isIncome ? "text-success" : "text-foreground",
        )}
      >
        {isIncome ? "+" : "−"}
        {formatMoney(Math.abs(transaction.amount))}
      </div>
    </div>
  );
}
