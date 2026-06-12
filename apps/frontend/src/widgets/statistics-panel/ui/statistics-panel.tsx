"use client";

import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatMoneyCompact, formatMoney } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { useTransactionsOverview } from "@/entities/transaction";

export function StatisticsPanel() {
  const { data, loading, error } = useTransactionsOverview(5);
  const totals = data?.totals;
  const items = data?.items ?? [];

  const income = totals?.income ?? 0;
  const expense = totals?.expense ?? 0;
  const sum = income + expense;
  const incomeDeg = sum > 0 ? (income / sum) * 360 : 0;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight">
          Статистика
          <Info className="size-4 text-muted-foreground" />
        </h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          За всё время
        </span>
      </div>

      {/* Donut */}
      <div className="relative mx-auto mt-6 grid size-44 place-items-center">
        <div
          className={cn(
            "size-44 rounded-full transition-[background]",
            (loading || error) && "animate-pulse",
          )}
          style={{
            background:
              loading || error
                ? "hsl(var(--muted))"
                : sum > 0
                  ? `conic-gradient(hsl(var(--brand)) 0deg ${incomeDeg}deg, hsl(var(--foreground)) ${incomeDeg}deg 360deg)`
                  : "hsl(var(--muted))",
          }}
          aria-hidden
        />
        <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-xs text-muted-foreground">Всего</span>
          <span className="font-display text-2xl font-bold tracking-tight nums">
            {loading || error ? "—" : formatMoneyCompact(totals?.balance ?? 0)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-5 text-xs">
        <LegendDot className="bg-brand" label="Доходы" />
        <LegendDot className="bg-foreground" label="Расходы" />
      </div>

      {/* Recent ops mini-list */}
      <div className="mt-6 flex-1 space-y-1">
        {error && (
          <p className="py-4 text-center text-sm text-danger">{error}</p>
        )}
        {!error && !loading && items.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Операций пока нет
          </p>
        )}
        {!error &&
          items.map((tx) => {
            const isIncome = tx.type === "INCOME";
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl px-1.5 py-2"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: `${tx.category.color}22` }}
                  aria-hidden
                >
                  {tx.category.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {tx.description}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tx.category.name}
                  </p>
                </div>
                <Badge variant={isIncome ? "income" : "expense"}>
                  {isIncome ? "+" : "−"}
                  {formatMoney(Math.abs(tx.amount))}
                </Badge>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <span className={cn("size-2.5 rounded-full", className)} aria-hidden />
      {label}
    </span>
  );
}
