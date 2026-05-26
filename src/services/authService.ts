import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { ref, update } from "firebase/database";
import { requireFirebase } from "../firebase/config";
import type { UserProfile } from "../types";

type SyncOptions = {
  force?: boolean;
  includeCreatedAt?: boolean;
};

const profileSyncs = new Map<string, Promise<void>>();

export function profileFromUser(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Member",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
  };
}

export function syncUserProfile(user: User, options: SyncOptions = {}) {
  if (!options.force && profileSyncs.has(user.uid)) {
    return profileSyncs.get(user.uid)!;
  }

  const { realtimeDb } = requireFirebase();
  const profile = profileFromUser(user);
  const now = Date.now();

  const sync = update(ref(realtimeDb, `users/${user.uid}`), {
    ...profile,
    ...(options.includeCreatedAt ? { createdAt: now } : {}),
    updatedAt: now,
  }).finally(() => {
    profileSyncs.delete(user.uid);
  });

  profileSyncs.set(user.uid, sync);
  return sync;
}

export function watchAuthState(onChange: (profile: UserProfile | null) => void) {
  const { auth } = requireFirebase();

  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      onChange(null);
      return;
    }

    onChange(profileFromUser(user));
    void syncUserProfile(user).catch((error: unknown) => {
      console.warn("Unable to sync user profile", error);
    });
  });
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { auth } = requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credentials.user, { displayName: name });
  void syncUserProfile(credentials.user, { force: true, includeCreatedAt: true }).catch((error: unknown) => {
    console.warn("Unable to sync new user profile", error);
  });
  return profileFromUser(credentials.user);
}

export async function signInWithEmail(email: string, password: string) {
  const { auth } = requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return profileFromUser(credentials.user);
}

export async function logout() {
  const { auth } = requireFirebase();
  await signOut(auth);
}
