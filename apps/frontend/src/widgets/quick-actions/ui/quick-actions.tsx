"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Plus, Receipt, Tags } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  CreateTransactionDialog,
} from "@/features/create-transaction";
import { transactionsRefresh } from "@/entities/transaction";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <CreateTransactionDialog
        onCreated={() => transactionsRefresh.bump()}
        renderTrigger={(open) => (
          <Tile as="button" onClick={open} brand icon={<Plus className="size-5" />}>
            Новая операция
          </Tile>
        )}
      />

      <Tile as="link" href="/transactions" icon={<Receipt className="size-5" />}>
        Транзакции
      </Tile>

      <Tile as="link" href="/categories" icon={<Tags className="size-5" />}>
        Категории
      </Tile>
    </div>
  );
}

type TileProps = {
  icon: ReactNode;
  children: ReactNode;
  brand?: boolean;
} & (
  | { as: "button"; onClick: () => void; href?: never }
  | { as: "link"; href: string; onClick?: never }
);

function Tile({ icon, children, brand, ...rest }: TileProps) {
  const className = cn(
    "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98]",
    brand
      ? "bg-brand text-brand-foreground hover:bg-brand/85"
      : "border border-border/70 bg-card text-foreground shadow-soft hover:bg-accent",
  );

  const badge = (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full",
        brand
          ? "bg-brand-foreground/15 text-brand-foreground"
          : "bg-foreground text-background",
      )}
      aria-hidden
    >
      {icon}
    </span>
  );

  if (rest.as === "button") {
    return (
      <button type="button" onClick={rest.onClick} className={className}>
        {badge}
        {children}
      </button>
    );
  }

  return (
    <Link href={rest.href} className={className}>
      {badge}
      {children}
    </Link>
  );
}
