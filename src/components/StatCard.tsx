import type { LucideIcon } from "lucide-react";
import { Panel } from "./ui/Panel";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
  return (
    <Panel className="min-h-32">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </Panel>
  );
}
