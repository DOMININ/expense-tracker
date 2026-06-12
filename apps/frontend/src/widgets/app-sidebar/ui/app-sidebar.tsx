"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ArrowLeftRight, Tags, PieChart, LogOut } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/auth";

const NAV_ITEMS = [
  { href: "/", label: "Обзор", icon: LayoutGrid },
  { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
  { href: "/categories", label: "Категории", icon: Tags },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[76px] flex-col items-center gap-2 bg-sidebar py-6">
      {/* Logo mark */}
      <Link
        href="/"
        aria-label="Expence Tracker"
        className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-sidebar-accent font-display text-xl font-extrabold text-sidebar"
      >
        Ξ
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex size-11 items-center justify-center rounded-2xl transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar"
                  : "text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-accent",
              )}
            >
              <Icon className="size-5" strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <span
          className="flex size-11 items-center justify-center rounded-2xl text-sidebar-foreground"
          aria-hidden
        >
          <PieChart className="size-5" strokeWidth={2} />
        </span>
        <LogoutButton
          variant="ghost"
          size="icon"
          aria-label="Выйти"
          className="size-11 rounded-2xl text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-accent"
        >
          <LogOut className="size-5" strokeWidth={2} />
        </LogoutButton>
      </div>
    </aside>
  );
}
