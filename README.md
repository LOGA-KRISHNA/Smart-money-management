# FairShare Expense Splitting App

Production-ready React + TypeScript + Firebase expense splitting application inspired by Splitwise and Settle Up.

## Features

- Firebase Authentication with email/password, persistent sessions and protected routes.
- Realtime Database-backed rooms with unique codes, invite links, members, admin permissions and leave-room support.
- Fast invite joins through `roomCodes/{code}` and fast dashboards through `userRooms/{uid}`.
- Expense management with title, description, amount, payer, tag, date, split type and participants.
- Custom room tags such as Food, Travel, Rent, Petrol and Shopping.
- Analytics for total room expense, category totals, user spending, monthly trends, highest spender and recent activity.
- Settlement algorithm that minimizes who owes whom.
- Responsive fintech UI with Tailwind CSS, dark/light mode, loading skeletons, toasts, search and filters.
- Firebase Hosting and Realtime Database security rules included.

## Realtime Database Paths

Open Firebase Console > Build > Realtime Database > Data to see application records.

- `users/{uid}`: profile, email, avatar, timestamps.
- `rooms/{roomId}`: name, description, code, invite link, creator, member ids, total expenses.
- `userRooms/{uid}/{roomId}`: room membership index for fast dashboard loading.
- `roomCodes/{code}`: room-code lookup for invite joins.
- `roomMembers/{roomId}/{uid}`: room member profile, role, status and joined date.
- `tags/{roomId}/{tagId}`: room category tags.
- `expenses/{roomId}/{expenseId}`: room expenses and participant splits.
- `settlements/{roomId}/{settlementId}`: recorded settlement transactions.

When a room is created, the app writes the room, creator membership, dashboard index, invite code and starter tags in one RTDB multi-path update.

When an expense is added, the app writes one expense record and updates `rooms/{roomId}/totalExpenses`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and paste your Firebase web app config, including `VITE_FIREBASE_DATABASE_URL`.

3. In Firebase Console, enable:

- Authentication: Email/Password provider.
- Realtime Database.
- Hosting.

4. Run locally:

```bash
npm run dev
```

Restart Vite after changing `.env`, because environment values are loaded at server startup.

## Firebase Deployment

Install Firebase CLI and log in:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

Deploy rules and hosting:

```bash
npm run build
firebase deploy
```

## Security Model

`database.rules.json` enforces:

- Authenticated users only.
- Users can read and update only their own profile and room index.
- Room data is visible only to members.
- Room members, tags, expenses and settlements are writable only by room members.
- Positive amount validation for expenses and settlement records.

## Scripts

- `npm run dev`: local Vite server.
- `npm run build`: TypeScript and production Vite build.
- `npm run lint`: ESLint.
- `npm run preview`: preview production build.
