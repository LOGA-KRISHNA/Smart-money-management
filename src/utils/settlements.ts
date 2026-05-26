import type { Expense, RoomMember, Settlement, UserSpend } from "../types";

export function calculateUserSpends(expenses: Expense[], members: RoomMember[]): UserSpend[] {
  const spends = new Map<string, UserSpend>();

  members
    .filter((member) => member.status === "active")
    .forEach((member) => {
      spends.set(member.userId, {
        userId: member.userId,
        name: member.displayName,
        paid: 0,
        owed: 0,
        net: 0,
      });
    });

  expenses.forEach((expense) => {
    const payer = spends.get(expense.paidBy);
    if (payer) {
      payer.paid += expense.amount;
    }

    expense.participants.forEach((participant) => {
      const user = spends.get(participant.userId);
      if (user) {
        user.owed += participant.share;
      }
    });
  });

  return Array.from(spends.values()).map((spend) => ({
    ...spend,
    net: spend.paid - spend.owed,
  }));
}

export function simplifySettlements(expenses: Expense[], members: RoomMember[]): Settlement[] {
  const epsilon = 0.5;
  const spends = calculateUserSpends(expenses, members);
  const debtors = spends
    .filter((spend) => spend.net < -epsilon)
    .map((spend) => ({ ...spend, amount: Math.abs(spend.net) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = spends
    .filter((spend) => spend.net > epsilon)
    .map((spend) => ({ ...spend, amount: spend.net }))
    .sort((a, b) => b.amount - a.amount);
  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > epsilon) {
      settlements.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= epsilon) {
      debtorIndex += 1;
    }

    if (creditor.amount <= epsilon) {
      creditorIndex += 1;
    }
  }

  return settlements;
}
