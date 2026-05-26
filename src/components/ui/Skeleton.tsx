export function Skeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}
