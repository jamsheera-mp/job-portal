import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../slices/adminSlice";
import type { RootState } from "../../../store/index";
import UserActions from "./UserActions";
import { Link } from "react-router-dom";

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const { jobSeekers, recruiters, loading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <Link
          to="/admin/users/add"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New User
        </Link>
      </div>
      
      {/* Job Seekers Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Job Seekers</h3>
        {jobSeekers.length === 0 ? (
          <p className="text-gray-600">No job seekers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobSeekers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserActions userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recruiters Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Recruiters</h3>
        {recruiters.length === 0 ? (
          <p className="text-gray-600">No recruiters found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recruiters.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserActions userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;