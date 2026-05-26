import { Plus, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RoomCard } from "../components/RoomCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Panel } from "../components/ui/Panel";
import { Skeleton } from "../components/ui/Skeleton";
import { hasFirebaseConfig } from "../firebase/config";
import { useAppSelector } from "../hooks/redux";
import { useRooms } from "../hooks/useRoomData";
import { createRoom, joinRoomByCode } from "../services/realtimeService";

export function RoomsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const search = useAppSelector((state) => state.ui.search.toLowerCase());
  const { rooms, loading } = useRooms(user?.uid);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const visibleRooms = rooms.filter((room) => `${room.name} ${room.description} ${room.code}`.toLowerCase().includes(search));

  async function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to create rooms.");
      return;
    }

    const roomId = await createRoom({ name, description, creator: user });
    toast.success("Room created.");
    navigate(`/rooms/${roomId}`);
  }

  async function submitJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!hasFirebaseConfig) {
      toast.success("Demo mode: connect Firebase to join rooms.");
      return;
    }

    const roomId = await joinRoomByCode(code, user);
    toast.success("Joined room.");
    navigate(`/rooms/${roomId}`);
  }

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Room management</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Your expense rooms</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Create room</h2>
          <form onSubmit={submitRoom} className="mt-4 grid gap-3">
            <Input label="Room name" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input label="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
            <Button>
              <Plus size={18} /> Create room
            </Button>
          </form>
        </Panel>
        <Panel>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Join with code</h2>
          <form onSubmit={submitJoin} className="mt-4 grid gap-3">
            <Input label="Room code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="GOA526" required />
            <Button variant="secondary">
              <UserPlus size={18} /> Join room
            </Button>
          </form>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
