import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../slices/adminSlice";
import type { RootState } from "../../../store/index";

const UserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const user = users.find((u) => u.id === userId);

  if (!user) return <div className="p-6 text-gray-600">User not found</div>;

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">User Details</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => window.history.back()}
      >
        Back
      </button>
    </div>
  );
};

export default UserDetails;