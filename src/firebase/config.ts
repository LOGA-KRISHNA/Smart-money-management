import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.databaseURL,
);

export const app: FirebaseApp | undefined = hasFirebaseConfig ? initializeApp(firebaseConfig) : undefined;
export const auth: Auth | undefined = app ? getAuth(app) : undefined;
export const realtimeDb: Database | undefined = app ? getDatabase(app) : undefined;

export function requireFirebase() {
  if (!auth || !realtimeDb) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values to .env.local.");
  }

  return { auth, realtimeDb };
}
