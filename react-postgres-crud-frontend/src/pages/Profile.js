import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";

const Profile = ({ setBreadcrumbExtra }) => {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    console.log("🧠 User from context:", user);
  }, [user]);

  const logout = () => {
    console.log("👋 Logging out...");
    setUser(null);
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
          👤 Profile
        </h1>

        {user ? (
          <>
            <div className="space-y-4 text-lg text-gray-700">
              <p>
                <span className="font-semibold">Username:</span>{" "}
                <span className="text-gray-900">{user.username}</span>
              </p>
              <p>
                <span className="font-semibold">Name:</span>{" "}
                <span className="text-gray-900">
                  {user.name || "❌ Not provided"}
                </span>
              </p>
              <p>
                <span className="font-semibold">User ID:</span>{" "}
                <span className="text-gray-900">{user.id}</span>
              </p>
            </div>

            <button
              onClick={logout}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-gray-500">Loading user info...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
