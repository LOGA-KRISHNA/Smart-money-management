import { Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { hasFirebaseConfig } from "../firebase/config";
import { addExpense } from "../services/realtimeService";
import type { RoomMember, Tag, UserProfile } from "../types";
import { createEqualSplit } from "../utils/splits";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Panel } from "./ui/Panel";

type ExpenseFormProps = {
  roomId: string;
  members: RoomMember[];
  tags: Tag[];
  user: UserProfile;
};

export function ExpenseForm({ roomId, members, tags, user }: ExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(user.uid);
  const [tagId, setTagId] = useState(tags[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const activeMembers = useMemo(() => members.filter((member) => member.status === "active"), [members]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedTag = tags.find((tag) => tag.id === tagId);
    const payer = activeMembers.find((member) => member.userId === paidBy);
    const numericAmount = Number(amount);

    if (!selectedTag || !payer || numericAmount <= 0) {
      toast.error("Add a valid title, amount, payer and tag.");
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to save real expenses.");
      return;
    }

    setSaving(true);
    try {
      await addExpense({
        roomId,
        title,
        description,
        amount: numericAmount,
        paidBy: payer.userId,
        paidByName: payer.displayName,
        tagId: selectedTag.id,
        tagName: selectedTag.name,
        date: Date.now(),
        splitType: "equal",
        participants: createEqualSplit(numericAmount, activeMembers),
        createdBy: user.uid,
      });
      setTitle("");
      setAmount("");
      setDescription("");
      toast.success("Expense added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-950 dark:text-white">Add expense</h3>
        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          Equal split
        </span>
      </div>
      <form onSubmit={submit} className="grid gap-3">
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Dinner, rent, petrol" required />
        <Input label="Amount" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <Input label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional note" />
        <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Paid by
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            {activeMembers.map((member) => (
              <option key={member.id} value={member.userId}>
                {member.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Tag
          <select
            value={tagId}
            onChange={(event) => setTagId(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={saving || tags.length === 0}>
          <Plus size={18} /> {saving ? "Saving..." : "Add expense"}
        </Button>
      </form>
    </Panel>
  );
}
