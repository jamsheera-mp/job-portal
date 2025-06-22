import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteUser } from "../slices/adminSlice";
import { Link } from "react-router-dom";

interface UserActionsProps {
  userId: string;
}

const UserActions: React.FC<UserActionsProps> = ({ userId }) => {
  const dispatch = useDispatch();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId));
    }
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <div className="space-x-2">
      <Link to={`/admin/users/details/${userId}`} className="text-blue-500 hover:text-blue-700">
        View Details
      </Link>
      <Link to={`/admin/users/edit/${userId}`} className="text-blue-500 hover:text-blue-700">
        Edit
      </Link>
      <button className="text-red-500 hover:text-red-700" onClick={handleDelete}>
        Delete
      </button>
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActions;