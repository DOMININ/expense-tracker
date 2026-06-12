"use client";

import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, MoreVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatMoneyCompact } from "@/shared/lib/format";
import { useTransactionsOverview } from "@/entities/transaction";

export function BalanceOverview() {
  const { data, loading, error } = useTransactionsOverview();
  const totals = data?.totals;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Dark balance card */}
      <article className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-card">
        <div className="bg-dots-light pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-primary-foreground/70">
              Текущий баланс
            </span>
            <MoreVertical className="size-5 text-primary-foreground/50" />
          </div>

          <p className="mt-6 font-display text-4xl font-bold tracking-tight nums">
            {loading ? (
              <Shimmer className="h-10 w-44 bg-primary-foreground/15" />
            ) : error ? (
              "—"
            ) : (
              formatMoneyCompact(totals?.balance ?? 0)
            )}
          </p>

          <div className="mt-auto flex items-center gap-2 pt-8 text-xs text-primary-foreground/60">
            <span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 font-semibold">
              За всё время
            </span>
            <span>Доходы минус расходы</span>
          </div>
        </div>
      </article>

      {/* Income / expense card */}
      <article className="flex flex-col justify-center gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
        <StatRow
          label="Доходы"
          icon={<ArrowUpRight className="size-4" />}
          tone="income"
          value={loading || error ? null : (totals?.income ?? 0)}
        />
        <div className="h-px bg-border" />
        <StatRow
          label="Расходы"
          icon={<ArrowDownLeft className="size-4" />}
          tone="expense"
          value={loading || error ? null : (totals?.expense ?? 0)}
        />
      </article>
    </div>
  );
}

function StatRow({
  label,
  icon,
  tone,
  value,
}: {
  label: string;
  icon: ReactNode;
  tone: "income" | "expense";
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          tone === "income"
            ? "bg-success/15 text-success"
            : "bg-foreground/10 text-foreground",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-semibold tracking-tight nums">
          {value === null ? (
            <Shimmer className="h-6 w-28" />
          ) : (
            <>
              {tone === "income" ? "+" : "−"}
              {formatMoneyCompact(value)}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block animate-pulse rounded-md bg-muted align-middle",
        className,
      )}
      aria-hidden
    />
  );
}
