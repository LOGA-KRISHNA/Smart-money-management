import type { ExpenseParticipant, RoomMember } from "../types";

export function createEqualSplit(amount: number, members: RoomMember[]): ExpenseParticipant[] {
  const activeMembers = members.filter((member) => member.status === "active");
  const share = activeMembers.length > 0 ? amount / activeMembers.length : 0;

  return activeMembers.map((member) => ({
    userId: member.userId,
    displayName: member.displayName,
    share,
  }));
}

export function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
