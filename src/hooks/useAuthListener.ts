import { useEffect } from "react";
import toast from "react-hot-toast";
import { demoUser } from "../data/demoData";
import { hasFirebaseConfig } from "../firebase/config";
import { setAuthLoading, setUser } from "../store/authSlice";
import { useAppDispatch } from "./redux";
import { watchAuthState } from "../services/authService";

export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!hasFirebaseConfig) {
      dispatch(setUser(demoUser));
      return undefined;
    }

    dispatch(setAuthLoading(true));

    try {
      return watchAuthState((profile) => {
        dispatch(setUser(profile));
      });
    } catch (error) {
      dispatch(setAuthLoading(false));
      toast.error(error instanceof Error ? error.message : "Unable to start authentication.");
      return undefined;
    }
  }, [dispatch]);
}
