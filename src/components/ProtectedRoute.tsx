import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { Skeleton } from "./ui/Skeleton";

export function ProtectedRoute() {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Skeleton />
      </main>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}
