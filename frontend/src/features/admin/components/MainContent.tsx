import React from "react";

interface MainContentProps {
  users: any[]; // Replace with specific user type from your schema
}

const MainContent: React.FC<MainContentProps> = ({ users }) => {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      <div className="bg-white p-4 shadow rounded-lg">
        <p className="text-gray-600">
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id} className="py-1">
                  {user.email}
                </li>
              ))}
            </ul>
          ) : (
            "No users available. Connect to API (e.g., http://localhost:5000/api/admin/users)."
          )}
        </p>
      </div>
    </div>
  );
};

export default MainContent;