import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Tasks = () => {
  const { user } = useContext(UserContext);

  return (
    <div>
      <h1>Tasks Page</h1>
      <p>Logged in as: {user?.username || "Guest"}</p>
    </div>
  );
};

export default Tasks;
