import React, { useEffect, useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

const Profile = ({ setBreadcrumbExtra }) => {
  const { user, setUser } = useContext(UserContext); // Get user and setUser from context
  const [userDetails, setUserDetails] = useState(null); // Local state for user details

  useEffect(() => {
    setBreadcrumbExtra?.(null); // Clear breadcrumb extras on mount

    if (user?.username) {
      // Fetch user details using the username
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`/api/users/${user.username}`); // Adjust API endpoint as needed
          const data = await response.json();
          setUserDetails(data); // Assuming the response contains user details
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
    }
  }, [setBreadcrumbExtra, user?.username]);

  const logout = () => {
    // Clear user from context and localStorage/sessionStorage
    setUser(null);
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user ? (
        <div className="bg-white p-4 rounded shadow">
          {userDetails ? (
            <>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Name:</strong> {userDetails.name || "Not provided"}
              </p>
              <p>
                <strong>User ID:</strong> {userDetails.user_id}
              </p>
              {/* Add more profile details here */}
            </>
          ) : (
            <p>Loading user details...</p>
          )}
          <button
            onClick={logout}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Profile;
