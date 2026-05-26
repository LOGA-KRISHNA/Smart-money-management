import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  theme: "light" | "dark";
  search: string;
};

const storedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;

const initialState: UiState = {
  theme: storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light",
  search: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.theme);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
});

export const { setSearch, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
