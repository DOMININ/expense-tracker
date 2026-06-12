"use client";

import { Search, ChevronDown } from "lucide-react";
import { useCurrentUser } from "../model/use-current-user";

export function AppHeader() {
  const { user } = useCurrentUser();
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground"
          aria-hidden
        >
          {(firstName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight">
            Привет{firstName ? `, ${firstName}` : ""}! <span aria-hidden>👋</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Под контролем — каждый рубль
          </p>
        </div>
      </div>

      {/* Search (decorative) */}
      <div className="relative flex-1 lg:mx-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Поиск операций, категорий…"
          className="h-11 w-full rounded-full border border-transparent bg-card pl-11 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>

      {/* Account chip */}
      <button
        type="button"
        className="flex shrink-0 items-center gap-2 rounded-full bg-primary py-1.5 pl-1.5 pr-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <span
          className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15 text-xs"
          aria-hidden
        >
          {(firstName ?? "?").charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[10ch] truncate sm:inline">
          {firstName ?? "Аккаунт"}
        </span>
        <ChevronDown className="size-4 opacity-70" />
      </button>
    </header>
  );
}
