import type { Expense } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type ActivityFeedProps = {
  expenses: Expense[];
};

export function ActivityFeed({ expenses }: ActivityFeedProps) {
  return (
    <div className="grid gap-3">
      {expenses.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
      ) : (
        expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{expense.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {expense.paidByName} paid in {expense.tagName} on {formatDate(expense.date)}
              </p>
            </div>
            <p className="font-bold text-slate-950 dark:text-white">{formatCurrency(expense.amount)}</p>
          </div>
        ))
      )}
    </div>
  );
}
