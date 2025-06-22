import React from "react";
import Users from "./Users";

interface MainContentProps {
  activePage: string;
}

const MainContent: React.FC<MainContentProps> = ({ activePage }) => {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      {activePage === "users" && <Users />}
      {activePage === "jobs" && <div>Jobs Page (To be implemented)</div>}
    </div>
  );
};

export default MainContent;