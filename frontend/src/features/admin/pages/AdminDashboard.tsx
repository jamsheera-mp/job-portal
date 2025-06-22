import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/index";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

const AdminDashboard: React.FC = () => {
  const users = useSelector((state: RootState) => state.admin.users);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MainContent users={users} />
    </div>
  );
};

export default AdminDashboard;