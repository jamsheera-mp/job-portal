import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@core/services/axiosInstance";
import type { JobSeeker } from "@core/types/types";

export const useProfile = () => {
  const [profile, setProfile] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/profile");
      setProfile(response.data.user as JobSeeker);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<JobSeeker>) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch("/profile", data);
      setProfile(response.data.user as JobSeeker);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfilePicture = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profilePictureUrl", file);
      const response = await axiosInstance.post("/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(response.data.user as JobSeeker);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Dependency array ensures it only runs on mount or fetchProfile change

  return { profile, loading, error, fetchProfile, updateProfile, uploadProfilePicture };
};