import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../slices/adminSlice";
import type { RootState } from "../../../store/index";

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users } = useSelector((state: RootState) => state.admin);
  const user = users.find((u) => u.id === userId);
  const [formData, setFormData] = useState({ email: "", role: "jobSeeker", name: "", phone: "" });

  useEffect(() => {
    if (user) {
      setFormData({ email: user.email, role: user.role, name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      dispatch(updateUser({ id: userId, data: formData }));
      navigate("/admin/users");
    }
  };

  if (!user) return <div className="p-6 text-gray-600">User not found</div>;

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Email"
        />
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Name"
        />
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Phone"
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="jobSeeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;