import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth";
import { AppHeader } from "@/widgets/app-header";
import { AppSidebar } from "@/widgets/app-sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-6 sm:px-8">
            <AppHeader />
            <div className="mt-7">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
