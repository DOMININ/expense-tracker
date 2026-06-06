import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth";
import { AppHeader } from "@/widgets/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/20">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
