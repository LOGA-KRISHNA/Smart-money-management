import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { Panel } from "../components/ui/Panel";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppSelector } from "../hooks/redux";

export function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="grid gap-6">
      <Panel className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user?.displayName ?? "Member"} src={user?.photoURL} size="lg" />
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">{user?.displayName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          {hasFirebaseConfig ? "Firebase session" : "Demo session"}
        </span>
      </Panel>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: UserRound, label: "Profile", body: "Name, email and avatar are synced from Firebase Authentication." },
          { icon: Mail, label: "Email auth", body: "Email/password sign-in is implemented with persistent Firebase sessions." },
          { icon: ShieldCheck, label: "Access", body: "Realtime Database rules restrict room data to active members and admins." },
        ].map(({ icon: Icon, label, body }) => (
          <Panel key={label}>
            <Icon className="text-emerald-500" size={24} />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">{label}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
