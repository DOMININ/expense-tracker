"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/auth";
import { useCurrentUser } from "../model/use-current-user";

const NAV_ITEMS = [
  { href: "/transactions", label: "Транзакции" },
  { href: "/categories", label: "Категории" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Expence Tracker
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                aria-hidden
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {user.name}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
