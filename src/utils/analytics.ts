import type { Expense, RoomAnalytics, RoomMember, TagSummary } from "../types";
import { monthKey, toMillis } from "./format";
import { calculateUserSpends } from "./settlements";

export function buildRoomAnalytics(expenses: Expense[], members: RoomMember[]): RoomAnalytics {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const perUser = calculateUserSpends(expenses, members).sort((a, b) => b.paid - a.paid);
  const tagMap = new Map<string, TagSummary>();

  expenses.forEach((expense) => {
    const current =
      tagMap.get(expense.tagId) ??
      ({
        tagId: expense.tagId,
        tagName: expense.tagName,
        total: 0,
        paidBy: {},
        percentage: 0,
        expenses: [],
      } satisfies TagSummary);

    current.total += expense.amount;
    current.paidBy[expense.paidByName] = (current.paidBy[expense.paidByName] ?? 0) + expense.amount;
    current.expenses.push(expense);
    tagMap.set(expense.tagId, current);
  });

  const perTag = Array.from(tagMap.values())
    .map((tag) => ({
      ...tag,
      percentage: totalExpense > 0 ? (tag.total / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const monthlyMap = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = monthKey(expense.date);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + expense.amount);
  });

  return {
    totalExpense,
    totalMembers: members.filter((member) => member.status === "active").length,
    totalTags: perTag.length,
    perUser,
    perTag,
    highestSpender: perUser[0],
    monthly: Array.from(monthlyMap.entries()).map(([month, total]) => ({ month, total })),
    recentExpenses: [...expenses].sort((a, b) => toMillis(b.date) - toMillis(a.date)).slice(0, 8),
  };
}
