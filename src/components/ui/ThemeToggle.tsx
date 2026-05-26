import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../../store/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Button } from "./Button";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <Button aria-label="Toggle color theme" variant="secondary" onClick={() => dispatch(toggleTheme())} className="px-3">
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
