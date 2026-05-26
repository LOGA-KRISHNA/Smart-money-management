import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  update,
  type Database,
  type Unsubscribe,
} from "firebase/database";
import { requireFirebase } from "../firebase/config";
import type { Expense, Room, RoomMember, Tag, UserProfile } from "../types";
import { generateRoomCode } from "../utils/splits";

type CreateRoomInput = {
  name: string;
  description: string;
  creator: UserProfile;
};

type CreateExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

type RoomRecord = Omit<Room, "id" | "memberIds"> & {
  memberIds?: Record<string, boolean>;
};

type RoomMemberRecord = Omit<RoomMember, "id">;
type TagRecord = Omit<Tag, "id">;
type ExpenseRecord = Omit<Expense, "id">;

const starterTags = [
  { name: "Food", color: "#16a34a" },
  { name: "Travel", color: "#2563eb" },
  { name: "Rent", color: "#9333ea" },
  { name: "Petrol", color: "#f97316" },
  { name: "Shopping", color: "#db2777" },
];

function roomInvite(code: string) {
  return `${window.location.origin}/join/${code}`;
}

function objectValues<T extends object>(value: unknown): Array<T & { id: string }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, T>).map(([id, item]) => ({ id, ...item }));
}

function normalizeRoom(id: string, room: RoomRecord): Room {
  return {
    ...room,
    id,
    memberIds: Object.keys(room.memberIds ?? {}),
    totalExpenses: room.totalExpenses ?? 0,
  };
}

async function getRoom(database: Database, roomId: string) {
  const snapshot = await get(ref(database, `rooms/${roomId}`));
  return snapshot.exists() ? normalizeRoom(roomId, snapshot.val() as RoomRecord) : null;
}

export function subscribeUserRooms(userId: string, onChange: (rooms: Room[]) => void): Unsubscribe {
  const { realtimeDb } = requireFirebase();
  const userRoomsRef = ref(realtimeDb, `userRooms/${userId}`);

  const unsubscribe = onValue(userRoomsRef, async (snapshot) => {
    const roomIds = Object.keys((snapshot.val() ?? {}) as Record<string, boolean>);
    const rooms = (await Promise.all(roomIds.map((roomId) => getRoom(realtimeDb, roomId))))
      .filter((room): room is Room => Boolean(room))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    onChange(rooms);
  });

  return () => {
    off(userRoomsRef);
    unsubscribe();
  };
}

export function subscribeRoom(roomId: string, onChange: (room: Room | null) => void): Unsubscribe {
  const { realtimeDb } = requireFirebase();
  const roomRef = ref(realtimeDb, `rooms/${roomId}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    onChange(snapshot.exists() ? normalizeRoom(roomId, snapshot.val() as RoomRecord) : null);
  });

  return () => {
    off(roomRef);
    unsubscribe();
  };
}

export function subscribeRoomMembers(roomId: string, onChange: (members: RoomMember[]) => void): Unsubscribe {
  const { realtimeDb } = requireFirebase();
  const membersRef = ref(realtimeDb, `roomMembers/${roomId}`);

  const unsubscribe = onValue(membersRef, (snapshot) => {
    onChange(
      objectValues<RoomMemberRecord>(snapshot.val())
        .map((member) => ({ ...member, roomId }))
        .sort((a, b) => a.joinedAt - b.joinedAt),
    );
  });

  return () => {
    off(membersRef);
    unsubscribe();
  };
}

export function subscribeRoomTags(roomId: string, onChange: (tags: Tag[]) => void): Unsubscribe {
  const { realtimeDb } = requireFirebase();
  const tagsRef = ref(realtimeDb, `tags/${roomId}`);

  const unsubscribe = onValue(tagsRef, (snapshot) => {
    onChange(
      objectValues<TagRecord>(snapshot.val())
        .map((tag) => ({ ...tag, roomId }))
        .sort((a, b) => a.createdAt - b.createdAt),
    );
  });

  return () => {
    off(tagsRef);
    unsubscribe();
  };
}

export function subscribeRoomExpenses(roomId: string, onChange: (expenses: Expense[]) => void): Unsubscribe {
  const { realtimeDb } = requireFirebase();
  const expensesRef = ref(realtimeDb, `expenses/${roomId}`);

  const unsubscribe = onValue(expensesRef, (snapshot) => {
    onChange(
      objectValues<ExpenseRecord>(snapshot.val())
        .map((expense) => ({ ...expense, roomId }))
        .sort((a, b) => b.date - a.date),
    );
  });

  return () => {
    off(expensesRef);
    unsubscribe();
  };
}

export async function createRoom({ name, description, creator }: CreateRoomInput) {
  const { realtimeDb } = requireFirebase();
  const roomRef = push(ref(realtimeDb, "rooms"));
  const roomId = roomRef.key;

  if (!roomId) {
    throw new Error("Unable to create room id.");
  }

  const code = generateRoomCode();
  const now = Date.now();
  await update(ref(realtimeDb), {
    [`rooms/${roomId}`]: {
      name,
      description,
      code,
      inviteLink: roomInvite(code),
      createdBy: creator.uid,
      createdAt: now,
      updatedAt: now,
      memberIds: { [creator.uid]: true },
      totalExpenses: 0,
      currency: "INR",
    } satisfies RoomRecord,
    [`roomCodes/${code}`]: roomId,
    [`userRooms/${creator.uid}/${roomId}`]: true,
  });

  const roomChildren: Record<string, unknown> = {
    [`roomMembers/${roomId}/${creator.uid}`]: {
      roomId,
      userId: creator.uid,
      displayName: creator.displayName,
      email: creator.email,
      photoURL: creator.photoURL ?? "",
      role: "admin",
      status: "active",
      joinedAt: now,
    } satisfies RoomMemberRecord,
  };

  starterTags.forEach((tag) => {
    const tagId = push(ref(realtimeDb, `tags/${roomId}`)).key;
    if (tagId) {
      roomChildren[`tags/${roomId}/${tagId}`] = {
        roomId,
        name: tag.name,
        color: tag.color,
        createdBy: creator.uid,
        createdAt: now,
      } satisfies TagRecord;
    }
  });

  await update(ref(realtimeDb), roomChildren);
  return roomId;
}

export async function joinRoomByCode(code: string, user: UserProfile) {
  const { realtimeDb } = requireFirebase();
  const normalizedCode = code.trim().toUpperCase();
  const codeSnapshot = await get(ref(realtimeDb, `roomCodes/${normalizedCode}`));

  if (!codeSnapshot.exists()) {
    throw new Error("Room code was not found.");
  }

  const roomId = codeSnapshot.val() as string;
  const now = Date.now();

  await update(ref(realtimeDb), {
    [`rooms/${roomId}/memberIds/${user.uid}`]: true,
    [`rooms/${roomId}/updatedAt`]: now,
    [`userRooms/${user.uid}/${roomId}`]: true,
    [`roomMembers/${roomId}/${user.uid}`]: {
      roomId,
      userId: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL ?? "",
      role: "member",
      status: "active",
      joinedAt: now,
    } satisfies RoomMemberRecord,
  });

  return roomId;
}

export async function leaveRoom(roomId: string, memberId: string, userId: string) {
  const { realtimeDb } = requireFirebase();
  const now = Date.now();

  await update(ref(realtimeDb), {
    [`roomMembers/${roomId}/${memberId}/status`]: "left",
    [`rooms/${roomId}/memberIds/${userId}`]: null,
    [`rooms/${roomId}/updatedAt`]: now,
    [`userRooms/${userId}/${roomId}`]: null,
  });
}

export async function createTag(roomId: string, name: string, color: string, createdBy: string) {
  const { realtimeDb } = requireFirebase();
  const tagRef = push(ref(realtimeDb, `tags/${roomId}`));
  const tagId = tagRef.key;

  if (!tagId) {
    throw new Error("Unable to create tag id.");
  }

  await update(ref(realtimeDb), {
    [`tags/${roomId}/${tagId}`]: {
      roomId,
      name,
      color,
      createdBy,
      createdAt: Date.now(),
    } satisfies TagRecord,
  });
}

export async function addExpense(expense: CreateExpenseInput) {
  const { realtimeDb } = requireFirebase();
  const expenseRef = push(ref(realtimeDb, `expenses/${expense.roomId}`));
  const expenseId = expenseRef.key;

  if (!expenseId) {
    throw new Error("Unable to create expense id.");
  }

  const now = Date.now();
  const roomSnapshot = await get(ref(realtimeDb, `rooms/${expense.roomId}/totalExpenses`));
  const currentTotal = Number(roomSnapshot.val() ?? 0);

  await update(ref(realtimeDb), {
    [`expenses/${expense.roomId}/${expenseId}`]: {
      ...expense,
      participants: expense.participants,
      createdAt: now,
      updatedAt: now,
    } satisfies ExpenseRecord,
    [`rooms/${expense.roomId}/totalExpenses`]: currentTotal + expense.amount,
    [`rooms/${expense.roomId}/updatedAt`]: now,
  });
}

export async function updateExpense(expenseId: string, previousAmount: number, expense: Partial<CreateExpenseInput>) {
  const { realtimeDb } = requireFirebase();

  if (!expense.roomId) {
    throw new Error("Room id is required to update an expense.");
  }

  const now = Date.now();
  const roomSnapshot = await get(ref(realtimeDb, `rooms/${expense.roomId}/totalExpenses`));
  const currentTotal = Number(roomSnapshot.val() ?? 0);
  const nextAmount = expense.amount ?? previousAmount;
  const updates: Record<string, unknown> = {
    [`rooms/${expense.roomId}/totalExpenses`]: currentTotal + nextAmount - previousAmount,
    [`rooms/${expense.roomId}/updatedAt`]: now,
    [`expenses/${expense.roomId}/${expenseId}/updatedAt`]: now,
  };

  Object.entries(expense).forEach(([key, value]) => {
    updates[`expenses/${expense.roomId}/${expenseId}/${key}`] = value;
  });

  await update(ref(realtimeDb), updates);
}

export async function deleteExpense(expense: Expense) {
  const { realtimeDb } = requireFirebase();
  const roomSnapshot = await get(ref(realtimeDb, `rooms/${expense.roomId}/totalExpenses`));
  const currentTotal = Number(roomSnapshot.val() ?? 0);
  const now = Date.now();

  await update(ref(realtimeDb), {
    [`expenses/${expense.roomId}/${expense.id}`]: null,
    [`rooms/${expense.roomId}/totalExpenses`]: Math.max(0, currentTotal - expense.amount),
    [`rooms/${expense.roomId}/updatedAt`]: now,
  });
}

export async function deleteTag(tagId: string, roomId?: string) {
  const { realtimeDb } = requireFirebase();

  if (!roomId) {
    throw new Error("Room id is required to delete a tag.");
  }

  await remove(ref(realtimeDb, `tags/${roomId}/${tagId}`));
}

export async function markSettlement(roomId: string, fromUserId: string, toUserId: string, amount: number, createdBy: string) {
  const { realtimeDb } = requireFirebase();
  const settlementRef = push(ref(realtimeDb, `settlements/${roomId}`));
  const settlementId = settlementRef.key;

  if (!settlementId) {
    throw new Error("Unable to create settlement id.");
  }

  await update(ref(realtimeDb), {
    [`settlements/${roomId}/${settlementId}`]: {
      roomId,
      fromUserId,
      toUserId,
      amount,
      createdBy,
      status: "recorded",
      createdAt: Date.now(),
    },
  });
}
