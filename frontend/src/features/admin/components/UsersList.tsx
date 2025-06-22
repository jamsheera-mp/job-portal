import React from "react";
import { useDispatch } from "react-redux";
import { deleteUser } from "../slices/adminSlice";
import UserActions from "./UserActions";

interface User {
  id: string;
  email: string;
  role: string;
}

interface UsersListProps {
  users: User[];
}

const UsersList: React.FC<UsersListProps> = ({ users }) => {
  const dispatch = useDispatch();

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Users List</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <UserActions userId={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => {/* Open UserForm for adding */}}
      >
        Add New User
      </button>
    </div>
  );
};

export default UsersList;