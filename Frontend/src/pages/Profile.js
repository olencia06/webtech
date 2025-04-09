import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { UserCircleIcon, LogOutIcon } from "lucide-react";

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
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full border border-indigo-100">
        <div className="flex items-center gap-3 mb-6">
          <UserCircleIcon className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
        </div>

        {user ? (
          <>
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                <span className="font-semibold text-gray-900">Username:</span>{" "}
                {user.username}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Name:</span>{" "}
                {user.name || (
                  <span className="italic text-red-500">Not provided</span>
                )}
              </p>
            </div>

            <button
              onClick={logout}
              className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <LogOutIcon className="w-5 h-5" /> Logout
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
