// src/components/LayoutWrapper.js
import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: "1", label: "Home", path: "/" },
  { key: "2", label: "Tasks", path: "/tasks" },
  { key: "3", label: "Calendar", path: "/dashboard" },
  { key: "4", label: "Profile", path: "/profile" },
];

const LayoutWrapper = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems.find(
    (item) => item.path === location.pathname
  )?.key;

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) navigate(item.path);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "20px", color: "#fff", fontWeight: "bold" }}>
          Planner {user?.username && `- ${user.username}`}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              style={{
                color: selectedKey === item.key ? "#FFD700" : "white",
                borderBottom:
                  selectedKey === item.key ? "2px solid #FFD700" : "none",
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Header>

      <Content style={{ padding: "40px 60px" }}>{children}</Content>

      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default LayoutWrapper;
