import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { demoExpenses, demoMembers, demoRooms, demoTags } from "../data/demoData";
import { hasFirebaseConfig } from "../firebase/config";
import {
  subscribeRoom,
  subscribeRoomExpenses,
  subscribeRoomMembers,
  subscribeRoomTags,
  subscribeUserRooms,
} from "../services/realtimeService";
import type { Expense, Room, RoomMember, Tag } from "../types";

export function useRooms(userId: string | undefined) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    if (!hasFirebaseConfig) {
      queueMicrotask(() => {
        setRooms(demoRooms.filter((room) => room.memberIds.includes(userId)));
        setLoading(false);
      });
      return undefined;
    }

    queueMicrotask(() => setLoading(true));
    const unsubscribe = subscribeUserRooms(userId, (nextRooms) => {
      setRooms(nextRooms);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { rooms: userId ? rooms : [], loading: userId ? loading : false };
}

export function useRoomBundle(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    if (!hasFirebaseConfig) {
      queueMicrotask(() => {
        setRoom(demoRooms.find((item) => item.id === roomId) ?? null);
        setMembers(demoMembers.filter((member) => member.roomId === roomId));
        setTags(demoTags.filter((tag) => tag.roomId === roomId));
        setExpenses(demoExpenses.filter((expense) => expense.roomId === roomId));
        setLoading(false);
      });
      return undefined;
    }

    queueMicrotask(() => setLoading(true));
    try {
      const unsubscribers = [
        subscribeRoom(roomId, setRoom),
        subscribeRoomMembers(roomId, setMembers),
        subscribeRoomTags(roomId, setTags),
        subscribeRoomExpenses(roomId, (nextExpenses) => {
          setExpenses(nextExpenses);
          setLoading(false);
        }),
      ];

      return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load room.");
      queueMicrotask(() => setLoading(false));
      return undefined;
    }
  }, [roomId]);

  return useMemo(
    () => (roomId ? { room, members, tags, expenses, loading } : { room: null, members: [], tags: [], expenses: [], loading: false }),
    [roomId, room, members, tags, expenses, loading],
  );
}
