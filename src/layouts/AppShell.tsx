import { CreditCard, Home, LogOut, Search, Settings, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../services/authService";
import { setUser } from "../store/authSlice";
import { setSearch } from "../store/uiSlice";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/rooms", label: "Rooms", icon: UsersRound },
  { to: "/profile", label: "Profile", icon: Settings },
];

export function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const search = useAppSelector((state) => state.ui.search);

  async function handleLogout() {
    if (hasFirebaseConfig) {
      await logout();
    }
    dispatch(setUser(null));
    navigate("/auth");
    toast.success("Signed out.");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white/82 p-4 backdrop-blur xl:block dark:border-white/10 dark:bg-slate-950/82">
        <div className="flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white">
            <CreditCard size={22} />
          </span>
          <div>
            <p className="text-lg font-black">FairShare</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Expense splitting</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="xl:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="relative hidden flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => dispatch(setSearch(event.target.value))}
                placeholder="Search rooms, expenses, categories"
                className="w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-white/10"
              />
            </div>
            <nav className="flex gap-1 xl:hidden">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} aria-label={label} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                  <Icon size={20} />
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? <Avatar name={user.displayName} src={user.photoURL} /> : null}
              <Button aria-label="Sign out" variant="ghost" onClick={() => void handleLogout()} className="px-3">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
