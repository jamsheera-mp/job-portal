import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/slices/authSlice';
import adminReducer from "@features/admin/slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;