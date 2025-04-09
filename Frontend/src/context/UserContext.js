import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const decoded = jwtDecode(storedToken);

        const fullUser = {
          ...parsedUser,
          id: decoded.id,
          name: decoded.name,
        };

        setUser(fullUser);
        console.log("✅ User restored from localStorage & token:", fullUser);
      } catch (err) {
        console.error("❌ Failed to restore user from localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    } else {
      console.log("⚠️ No user or token in localStorage.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
