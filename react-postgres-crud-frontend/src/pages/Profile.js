import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Profile = () => {
  const { user } = useContext(UserContext);

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Logged in as: {user?.username || "Guest"}</p>
    </div>
  );
};

export default Profile;
