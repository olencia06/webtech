import React from "react";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";

const Home = ({ user }) => {
  const navigate = useNavigate();

  return (
    <LayoutWrapper user={user}>
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Welcome {user?.username || "Guest"}!</h1>
        {user ? (
          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        ) : (
          <button onClick={() => navigate("/login")}>Login</button>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default Home;
