import { ArrowRight } from "lucide-react";
import type { Settlement } from "../types";
import { formatCurrency } from "../utils/format";
import { Panel } from "./ui/Panel";

type SettlementListProps = {
  settlements: Settlement[];
};

export function SettlementList({ settlements }: SettlementListProps) {
  return (
    <Panel>
      <h3 className="text-base font-bold text-slate-950 dark:text-white">Settle up</h3>
      <div className="mt-4 grid gap-3">
        {settlements.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Everyone is settled.</p>
        ) : (
          settlements.map((settlement) => (
            <div
              key={`${settlement.fromUserId}-${settlement.toUserId}-${settlement.amount}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="truncate">{settlement.fromName}</span>
                <ArrowRight size={16} className="shrink-0 text-emerald-500" />
                <span className="truncate">{settlement.toName}</span>
              </div>
              <strong className="shrink-0 text-slate-950 dark:text-white">{formatCurrency(settlement.amount)}</strong>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
