import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { hasFirebaseConfig } from "../firebase/config";
import type { UserProfile } from "../types";

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  firebaseReady: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: hasFirebaseConfig,
  firebaseReady: hasFirebaseConfig,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAuthLoading, setUser } = authSlice.actions;
export default authSlice.reducer;
