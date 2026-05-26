import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Skeleton } from "./components/ui/Skeleton";
import { useAppSelector } from "./hooks/redux";
import { useAuthListener } from "./hooks/useAuthListener";

const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const RoomsPage = lazy(() => import("./pages/RoomsPage").then((module) => ({ default: module.RoomsPage })));
const RoomPage = lazy(() => import("./pages/RoomPage").then((module) => ({ default: module.RoomPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const JoinRoomPage = lazy(() => import("./pages/JoinRoomPage").then((module) => ({ default: module.JoinRoomPage })));

function App() {
  const theme = useAppSelector((state) => state.ui.theme);
  useAuthListener();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl p-6">
            <Skeleton />
          </main>
        }
      >
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:roomId" element={<RoomPage />} />
              <Route path="/join/:code" element={<JoinRoomPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
