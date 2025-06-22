import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@core/services/axiosInstance";

export interface User {
  id: string;
  email: string;
  role: "jobSeeker" | "recruiter" | "admin";
  name?: string;
  phone?: string;
  password?: string;
  company?: { name: string };
  isBlocked?: boolean;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminState {
  users: User[];
  jobSeekers: User[];
  recruiters: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  jobSeekers: [],
  recruiters: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
});

export const addUser = createAsyncThunk("admin/addUser", async (userData: User) => {
  console.log("[addUser] Sending request with data:", userData);
  const response = await axiosInstance.post("/admin/users", userData);
  console.log("[addUser] Response received:", response.data);
  return response.data;
});

export const updateUser = createAsyncThunk("admin/updateUser", async ({ id, data }: { id: string; data: User }) => {
  const response = await axiosInstance.put(`/admin/users/${id}`, data);
  return response.data;
});

export const deleteUser = createAsyncThunk("admin/deleteUser", async (id: string) => {
  await axiosInstance.delete(`/admin/users/${id}`);
  return id;
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
        state.jobSeekers = action.payload.filter((user) => user.role === "jobSeeker");
        state.recruiters = action.payload.filter((user) => user.role === "recruiter");
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
        if (action.payload.role === "jobSeeker") state.jobSeekers.push(action.payload);
        else if (action.payload.role === "recruiter") state.recruiters.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
          state.jobSeekers = state.users.filter((user) => user.role === "jobSeeker");
          state.recruiters = state.users.filter((user) => user.role === "recruiter");
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.jobSeekers = state.users.filter((user) => user.role === "jobSeeker");
        state.recruiters = state.users.filter((user) => user.role === "recruiter");
      });
  },
});

export default adminSlice.reducer;