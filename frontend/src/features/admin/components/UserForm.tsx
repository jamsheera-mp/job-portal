import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../slices/adminSlice";

interface UserFormData {
  email: string;
  password: string;
  role: "jobSeeker" | "recruiter";
  name?: string;
  phone?: string;
  company?: { name: string };
}

const UserForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    role: "jobSeeker",
    name: "",
    phone: "",
    company: { name: "" },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { ...formData };
    if (userData.role === "recruiter" && !userData.company?.name) {
      alert("Company name is required for recruiters.");
      return;
    }
    if (userData.role === "jobSeeker" && (!userData.name || !userData.phone)) {
      alert("Name and phone are required for job seekers.");
      return;
    }
    dispatch(addUser(userData));
    navigate("/admin/users");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value as "jobSeeker" | "recruiter",
        name: value === "jobSeeker" ? prev.name : undefined,
        phone: value === "jobSeeker" ? prev.phone : undefined,
        company: value === "recruiter" ? prev.company : undefined,
      }));
    } else if (name === "companyName") {
      setFormData((prev) => ({
        ...prev,
        company: { name: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Password"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
          required
        >
          <option value="jobSeeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        {formData.role === "jobSeeker" && (
          <>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Name"
              required
            />
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Phone"
              required
            />
          </>
        )}
        {formData.role === "recruiter" && (
          <input
            type="text"
            name="companyName"
            value={formData.company?.name || ""}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
            placeholder="Company Name"
            required
          />
        )}
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

export default UserForm;