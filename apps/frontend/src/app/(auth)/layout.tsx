import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-accent lg:flex lg:flex-col">
        <div className="bg-dots-light pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-accent font-display text-xl font-extrabold text-sidebar">
            Ξ
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Expence Tracker
          </span>
        </div>

        <div className="relative mt-auto max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Деньги под контролем — каждый день.
          </h1>
          <p className="mt-4 text-sidebar-foreground">
            Записывайте доходы и расходы, разбивайте операции по категориям и
            следите за балансом в одном месте.
          </p>
        </div>

        <p className="relative mt-12 text-sm text-sidebar-foreground">
          © {new Date().getFullYear()} Expence Tracker
        </p>
      </aside>

      {/* Form area */}
      <main className="flex flex-col items-center justify-center bg-background px-4 py-10">
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary font-display text-lg font-extrabold text-primary-foreground">
            Ξ
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Expence Tracker
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
