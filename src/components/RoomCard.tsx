import { Link } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import type { Room } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { Panel } from "./ui/Panel";

type RoomCardProps = {
  room: Room;
};

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link to={`/rooms/${room.id}`} className="group block">
      <Panel className="h-full transition duration-200 group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">{room.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{room.description}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {room.code}
          </span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total expense</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-300">{formatCurrency(room.totalExpenses)}</p>
          </div>
          <div className="grid gap-1 text-right text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center justify-end gap-1">
              <Users size={14} /> {room.memberIds.length} members
            </span>
            <span className="inline-flex items-center justify-end gap-1">
              <CalendarDays size={14} /> {formatDate(room.createdAt)}
            </span>
          </div>
        </div>
      </Panel>
    </Link>
  );
}
