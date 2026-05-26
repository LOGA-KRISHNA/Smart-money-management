import { CreditCard } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { signInWithEmail, signUpWithEmail } from "../services/authService";
import { setUser } from "../store/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Panel } from "../components/ui/Panel";
import { demoUser } from "../data/demoData";

export function AuthPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!hasFirebaseConfig) {
      dispatch(setUser(demoUser));
      toast.success("Demo session started. Add Firebase env values for production auth.");
      return;
    }

    setLoading(true);
    try {
      const profile = mode === "signup" ? await signUpWithEmail(name, email, password) : await signInWithEmail(email, password);
      dispatch(setUser(profile));
      toast.success("Welcome back.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500">
              <CreditCard size={24} />
            </span>
            <p className="text-xl font-black">FairShare</p>
          </div>
          <h1 className="mt-12 max-w-xl text-4xl font-black leading-tight md:text-6xl">
            Split expenses without spreadsheet drama.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Rooms, tags, real-time spending charts, role-based permissions and simplified settlement transactions in one Firebase-backed app.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["Real-time rooms", "Smart settle up", "Dark mode ready"].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <Panel className="p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{mode === "signup" ? "Create account" : "Sign in"}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {hasFirebaseConfig
              ? "Use your email and password to continue."
              : "Firebase env values are missing, so this form starts a demo session."}
          </p>
          <form onSubmit={submit} aria-busy={loading} className="mt-6 grid gap-4">
            {mode === "signup" ? (
              <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required disabled={loading} />
            ) : null}
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
            <Button disabled={loading}>{loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}</Button>
          </form>
          <button
            type="button"
            disabled={loading}
            className="mt-5 text-sm font-semibold text-emerald-600 dark:text-emerald-300"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </Panel>
      </div>
    </main>
  );
}
