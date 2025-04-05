import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Card } from "antd";
import LayoutWrapper from "../components/LayoutWrapper";

const { Title, Paragraph } = Typography;

const Home = ({ user, setBreadcrumbExtra }) => {
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbExtra?.(null); // Clear breadcrumb extras on Home
  }, [setBreadcrumbExtra]);

  return (
    <LayoutWrapper user={user}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Card
          style={{
            padding: 32,
            width: 500,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={2}>Welcome {user?.username || "Guest"}!</Title>
          <Paragraph>
            {user
              ? "Glad to see you back. Head to your dashboard to get started!"
              : "Please log in to access your dashboard and tasks."}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(user ? "/dashboard" : "/login")}
          >
            {user ? "Go to Dashboard" : "Login"}
          </Button>
        </Card>
      </div>
    </LayoutWrapper>
  );
};

export default Home;
