import { Tags, TrendingUp, Users, WalletCards } from "lucide-react";
import { ActivityFeed } from "../components/ActivityFeed";
import { AnalyticsCharts } from "../components/charts/AnalyticsCharts";
import { RoomCard } from "../components/RoomCard";
import { StatCard } from "../components/StatCard";
import { Panel } from "../components/ui/Panel";
import { Skeleton } from "../components/ui/Skeleton";
import { useAppSelector } from "../hooks/redux";
import { useRoomBundle, useRooms } from "../hooks/useRoomData";
import { buildRoomAnalytics } from "../utils/analytics";
import { formatCurrency } from "../utils/format";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const search = useAppSelector((state) => state.ui.search.toLowerCase());
  const { rooms, loading } = useRooms(user?.uid);
  const visibleRooms = rooms.filter((room) => `${room.name} ${room.description} ${room.code}`.toLowerCase().includes(search));
  const selectedRoomId = visibleRooms[0]?.id;
  const roomBundle = useRoomBundle(selectedRoomId);
  const analytics = buildRoomAnalytics(roomBundle.expenses, roomBundle.members);
  const totalAcrossRooms = rooms.reduce((sum, room) => sum + room.totalExpenses, 0);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">Hi {user?.displayName.split(" ")[0]}, your shared money is organized.</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Track rooms, compare category spending, find the highest spender and settle balances with fewer transfers.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={WalletCards} label="Total expenses" value={formatCurrency(totalAcrossRooms)} detail="Across all joined rooms" />
        <StatCard icon={Users} label="Total members" value={String(analytics.totalMembers)} detail="In the active room preview" />
        <StatCard icon={Tags} label="Total tags" value={String(analytics.totalTags)} detail="Tracked categories" />
        <StatCard
          icon={TrendingUp}
          label="Highest spender"
          value={analytics.highestSpender?.name.split(" ")[0] ?? "None"}
          detail={analytics.highestSpender ? formatCurrency(analytics.highestSpender.paid) : "No spending yet"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Recent rooms</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleRooms.slice(0, 4).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          <AnalyticsCharts analytics={analytics} />
        </div>
        <Panel>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Recent activity</h2>
          <div className="mt-4">
            <ActivityFeed expenses={analytics.recentExpenses} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
