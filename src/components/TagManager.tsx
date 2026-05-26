import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { hasFirebaseConfig } from "../firebase/config";
import { createTag, deleteTag } from "../services/realtimeService";
import type { Tag, UserProfile } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Panel } from "./ui/Panel";

const colors = ["#10b981", "#2563eb", "#f97316", "#db2777", "#9333ea", "#14b8a6"];

type TagManagerProps = {
  roomId: string;
  tags: Tag[];
  user: UserProfile;
};

export function TagManager({ roomId, tags, user }: TagManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to create tags.");
      return;
    }

    try {
      await createTag(roomId, name.trim(), color, user.uid);
      setName("");
      toast.success("Tag created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create tag.");
    }
  }

  async function remove(tagId: string) {
    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to delete tags.");
      return;
    }

    await deleteTag(tagId, roomId);
    toast.success("Tag deleted.");
  }

  return (
    <Panel>
      <h3 className="text-base font-bold text-slate-950 dark:text-white">Tags</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-white/10">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
            <button aria-label={`Delete ${tag.name}`} onClick={() => void remove(tag.id)} className="text-slate-400 hover:text-rose-500">
              <Trash2 size={14} />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <Input label="New tag" value={name} onChange={(event) => setName(event.target.value)} placeholder="Food, rent, travel" />
        <div className="flex flex-wrap gap-2">
          {colors.map((item) => (
            <button
              key={item}
              aria-label={`Use color ${item}`}
              type="button"
              onClick={() => setColor(item)}
              className={`h-8 w-8 rounded-full border-2 ${item === color ? "border-slate-950 dark:border-white" : "border-transparent"}`}
              style={{ backgroundColor: item }}
            />
          ))}
        </div>
        <Button variant="secondary">
          <Plus size={18} /> Create tag
        </Button>
      </form>
    </Panel>
  );
}
