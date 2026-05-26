export type UserRole = "admin" | "member";
export type SplitType = "equal" | "percentage" | "custom";
export type MemberStatus = "active" | "left";
export type DateValue = number;

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  code: string;
  inviteLink?: string;
  createdBy: string;
  createdAt: DateValue;
  updatedAt: DateValue;
  memberIds: string[];
  totalExpenses: number;
  currency: "INR";
};

export type RoomMember = {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  status: MemberStatus;
  joinedAt: DateValue;
};

export type Tag = {
  id: string;
  roomId: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: DateValue;
};

export type ExpenseParticipant = {
  userId: string;
  displayName: string;
  share: number;
  percentage?: number;
};

export type Expense = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  tagId: string;
  tagName: string;
  date: DateValue;
  splitType: SplitType;
  participants: ExpenseParticipant[];
  createdBy: string;
  createdAt: DateValue;
  updatedAt: DateValue;
};

export type Settlement = {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
};

export type Activity = {
  id: string;
  roomId: string;
  title: string;
  body: string;
  createdAt: DateValue;
};

export type UserSpend = {
  userId: string;
  name: string;
  paid: number;
  owed: number;
  net: number;
};

export type TagSummary = {
  tagId: string;
  tagName: string;
  total: number;
  paidBy: Record<string, number>;
  percentage: number;
  expenses: Expense[];
};

export type RoomAnalytics = {
  totalExpense: number;
  totalMembers: number;
  totalTags: number;
  perUser: UserSpend[];
  perTag: TagSummary[];
  highestSpender?: UserSpend;
  monthly: Array<{ month: string; total: number }>;
  recentExpenses: Expense[];
};
