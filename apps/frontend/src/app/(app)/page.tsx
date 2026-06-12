import { BalanceOverview } from "@/widgets/balance-overview";
import { QuickActions } from "@/widgets/quick-actions";
import { RecentTransactions } from "@/widgets/recent-transactions";
import { StatisticsPanel } from "@/widgets/statistics-panel";

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="animate-fade-up" style={{ animationDelay: "40ms" }}>
          <BalanceOverview />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <QuickActions />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <RecentTransactions />
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <StatisticsPanel />
      </div>
    </div>
  );
}
