import { Copy, LogOut, Pencil, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ActivityFeed } from "../components/ActivityFeed";
import { AnalyticsCharts } from "../components/charts/AnalyticsCharts";
import { ExpenseForm } from "../components/ExpenseForm";
import { SettlementList } from "../components/SettlementList";
import { StatCard } from "../components/StatCard";
import { TagManager } from "../components/TagManager";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Panel } from "../components/ui/Panel";
import { Skeleton } from "../components/ui/Skeleton";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppSelector } from "../hooks/redux";
import { useRoomBundle } from "../hooks/useRoomData";
import { deleteExpense, leaveRoom, updateExpense } from "../services/realtimeService";
import type { Expense } from "../types";
import { buildRoomAnalytics } from "../utils/analytics";
import { formatCurrency, formatDate } from "../utils/format";
import { createEqualSplit } from "../utils/splits";
import { simplifySettlements } from "../utils/settlements";

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const search = useAppSelector((state) => state.ui.search.toLowerCase());
  const { room, members, tags, expenses, loading } = useRoomBundle(roomId);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const analytics = useMemo(() => buildRoomAnalytics(expenses, members), [expenses, members]);
  const settlements = useMemo(() => simplifySettlements(expenses, members), [expenses, members]);
  const currentMember = members.find((member) => member.userId === user?.uid && member.status === "active");
  const isAdmin = currentMember?.role === "admin";
  const visibleExpenses = expenses.filter((expense) =>
    `${expense.title} ${expense.description} ${expense.tagName} ${expense.paidByName}`.toLowerCase().includes(search),
  );

  if (loading) {
    return <Skeleton />;
  }

  if (!room || !user) {
    return <Navigate to="/rooms" replace />;
  }

  function startEdit(expense: Expense) {
    setEditing(expense);
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    const amount = Number(editAmount);
    if (amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to edit expenses.");
      return;
    }

    await updateExpense(editing.id, editing.amount, {
      roomId: editing.roomId,
      title: editTitle,
      amount,
      participants: createEqualSplit(amount, members),
    });
    setEditing(null);
    toast.success("Expense updated.");
  }

  async function removeExpense(expense: Expense) {
    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to delete expenses.");
      return;
    }

    await deleteExpense(expense);
    toast.success("Expense deleted.");
  }

  async function handleLeave() {
    if (!currentMember || !room || !user) {
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to leave rooms.");
      return;
    }

    await leaveRoom(room.id, currentMember.id, user.uid);
    navigate("/rooms");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Room code {room.code}</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">{room.name}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">{room.description}</p>
            <p className="mt-3 text-sm text-slate-400">Created {formatDate(room.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(room.inviteLink ?? room.code);
                toast.success("Invite copied.");
              }}
            >
              <Copy size={18} /> Invite
            </Button>
            <Button variant="danger" onClick={() => void handleLeave()}>
              <LogOut size={18} /> Leave
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Members" value={String(analytics.totalMembers)} detail="Active collaborators" />
        <StatCard icon={Copy} label="Total expense" value={formatCurrency(analytics.totalExpense)} detail="All recorded spending" />
        <StatCard icon={Pencil} label="Tags" value={String(analytics.totalTags)} detail="Expense categories" />
        <StatCard
          icon={Users}
          label="Highest spender"
          value={analytics.highestSpender?.name.split(" ")[0] ?? "None"}
          detail={analytics.highestSpender ? formatCurrency(analytics.highestSpender.paid) : "No expenses yet"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <AnalyticsCharts analytics={analytics} />
          <Panel>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Expense history</h2>
            <div className="mt-4 grid gap-3">
              {visibleExpenses.map((expense) => {
                const canModify = isAdmin || expense.createdBy === user.uid;
                return (
                  <div key={expense.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_auto] dark:bg-white/5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950 dark:text-white">{expense.title}</h3>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                          {expense.tagName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {expense.description || "No description"} · {expense.paidByName} paid · {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 md:justify-end">
                      <strong className="text-lg text-slate-950 dark:text-white">{formatCurrency(expense.amount)}</strong>
                      {canModify ? (
                        <>
                          <Button aria-label={`Edit ${expense.title}`} variant="ghost" className="px-3" onClick={() => startEdit(expense)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            aria-label={`Delete ${expense.title}`}
                            variant="ghost"
                            className="px-3 text-rose-500"
                            onClick={() => void removeExpense(expense)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Tag contribution</h2>
            <div className="mt-4 grid gap-3">
              {analytics.perTag.map((tag) => (
                <div key={tag.tagId} className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{tag.tagName}</strong>
                    <span>{formatCurrency(tag.total)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(tag.percentage, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tag.percentage.toFixed(1)}% of room expenses</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Members</h2>
            <div className="mt-4 grid gap-3">
              {members
                .filter((member) => member.status === "active")
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.displayName} src={member.photoURL} />
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{member.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
          <ExpenseForm roomId={room.id} members={members} tags={tags} user={user} />
          <TagManager roomId={room.id} tags={tags} user={user} />
          <SettlementList settlements={settlements} />
          <Panel>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Recent transactions</h2>
            <div className="mt-4">
              <ActivityFeed expenses={analytics.recentExpenses} />
            </div>
          </Panel>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4">
          <Panel className="w-full max-w-md">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Edit expense</h2>
            <div className="mt-4 grid gap-3">
              <Input label="Title" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
              <Input label="Amount" type="number" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={() => void saveEdit()}>Save</Button>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
