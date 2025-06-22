import React from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        <ul>
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 ${
                activePage === "users" ? "bg-gray-200 text-gray-800" : ""
              }`}
              onClick={() => setActivePage("users")}
            >
              <Users className="mr-2" size={18} />
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/jobs"
              className={`flex items-center py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 ${
                activePage === "jobs" ? "bg-gray-200 text-gray-800" : ""
              }`}
              onClick={() => setActivePage("jobs")}
            >
              <Briefcase className="mr-2" size={18} />
              Jobs
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;