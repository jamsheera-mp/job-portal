import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {type  RootState } from '@store/index';
import { setUser, clearUser } from '@features/auth/slices/authSlice';
import { api } from '@core/services/api';

interface Profile {
  email: string;
  phone?: string;
  fullName?: string;
  companyName?: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const role = user?.role;

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.fetchProfile();
      dispatch(setUser(response.user));
      return true;
    } catch (error) {
      dispatch(clearUser());
      return false;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await api.logout();
    dispatch(clearUser());
  }, [dispatch]);

  return {
    isAuthenticated: () => isAuthenticated,
    role,
    profile: user as Profile | null,
    checkAuth,
    logout,
  };
};