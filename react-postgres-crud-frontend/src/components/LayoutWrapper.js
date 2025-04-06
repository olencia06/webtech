import React, { useState } from "react";
import { Layout, Menu, Drawer } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import ProfilePage from "../pages/Profile"; // Assuming the Profile content is in a ProfilePage component

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: "1", label: "Home", path: "/home" },
  { key: "2", label: "Tasks", path: "/tasks" },
  { key: "3", label: "Notes", path: "/Notes" },
  { key: "4", label: "Calendar", path: "/dashboard" },
  { key: "5", label: "Profile", path: "/profile" },
];

const LayoutWrapper = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerVisible, setDrawerVisible] = useState(false); // State to control drawer visibility
  const selectedKey = menuItems.find(
    (item) => item.path === location.pathname
  )?.key;

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) {
      if (key === "5") {
        setDrawerVisible(true); // Open the drawer when "Profile" is clicked
      } else {
        navigate(item.path); // Navigate to the respective page
      }
    }
  };

  // Close the drawer when the close button is clicked
  const closeDrawer = () => setDrawerVisible(false);

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
                  selectedKey === item.key
                    ? "2px solidrgb(0, 145, 255)"
                    : "none",
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

      {/* Drawer for Profile */}
      <Drawer
        title="Profile"
        placement="right"
        closable
        onClose={closeDrawer} // Close the drawer when the close button is clicked
        visible={drawerVisible} // Control visibility of the drawer
        width={400}
        destroyOnClose // Ensure content is re-rendered when the drawer is closed and opened again
      >
        <ProfilePage /> {/* Content of the Profile drawer */}
      </Drawer>
    </Layout>
  );
};

export default LayoutWrapper;
