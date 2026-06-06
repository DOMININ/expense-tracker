import { cn } from "@/shared/lib/utils";
import type { Transaction } from "../model/types";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const amountFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "INCOME";
  const sign = isIncome ? "+" : "−";

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `${transaction.category.color}33` }}
        aria-hidden
      >
        <span>{transaction.category.icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-tight">
          {transaction.description}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {transaction.category.name} · {dateFormatter.format(new Date(transaction.date))}
        </p>
      </div>

      <div
        className={cn(
          "shrink-0 font-semibold tabular-nums",
          isIncome ? "text-green-600" : "text-red-600",
        )}
      >
        {sign}
        {amountFormatter.format(Math.abs(transaction.amount))}
      </div>
    </div>
  );
}
