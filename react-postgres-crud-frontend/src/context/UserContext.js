import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on mount to persist user data across page refreshes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const user_id = localStorage.getItem("id");

    // Log to check if values are being retrieved correctly
    console.log("Fetched from localStorage:", { token, username, user_id });

    // If we find user data in localStorage, set it in state
    if (token && username && user_id) {
      setUser({ username, user_id, token }); // Set user details from localStorage
    } else {
      console.log("User data not found in localStorage");
    }

    setLoading(false); // Only after checking storage
  }, []);

  // Persist changes to `user` state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("token", user.token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("id", user.user_id);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("id");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
