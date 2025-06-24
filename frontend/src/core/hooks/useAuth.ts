import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@store/index";
import { setUser, clearUser } from "@features/auth/slices/authSlice";
import { api } from "@core/services/api";
import type { JobSeeker } from "@core/types/types";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const role = user?.role;

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.fetchProfile();
      dispatch(setUser(response.user));
      return user?.role || "jobSeeker"; // Return role or default
    } catch (error) {
      dispatch(clearUser());
      return false;
    }
  }, [dispatch, user?.role]); // Added user?.role as dependency

  const logout = useCallback(async () => {
    await api.logout();
    dispatch(clearUser());
  }, [dispatch]);

  return {
    isAuthenticated: () => isAuthenticated,
    role,
    profile: user as JobSeeker | null,
    checkAuth,
    logout,
  };
};