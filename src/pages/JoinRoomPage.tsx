import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppSelector } from "../hooks/redux";
import { joinRoomByCode } from "../services/realtimeService";

export function JoinRoomPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code || !user) {
      queueMicrotask(() => setJoining(false));
      return;
    }

    if (!hasFirebaseConfig) {
      queueMicrotask(() => {
        setError("Connect Firebase Realtime Database to join rooms by invite.");
        setJoining(false);
      });
      return;
    }

    let cancelled = false;

    joinRoomByCode(code, user)
      .then((roomId) => {
        if (!cancelled) {
          toast.success("Joined room.");
          navigate(`/rooms/${roomId}`, { replace: true });
        }
      })
      .catch((joinError: unknown) => {
        if (!cancelled) {
          setError(joinError instanceof Error ? joinError.message : "Unable to join room.");
          setJoining(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, navigate, user]);

  if (!code) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center">
      <Panel className="w-full text-center">
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">{joining ? "Joining room..." : "Invite link"}</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {joining ? `Adding you to room ${code.toUpperCase()}.` : error}
        </p>
        {!joining ? (
          <Button className="mt-5" onClick={() => navigate("/rooms")}>
            Back to rooms
          </Button>
        ) : null}
      </Panel>
    </div>
  );
}
