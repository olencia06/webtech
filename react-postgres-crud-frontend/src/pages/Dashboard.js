import React, { useState } from "react";
import { Breadcrumb, theme } from "antd";
import CalendarComponent from "../components/CalendarComponent";
import TasksPage from "./Tasks";
import ProfilePage from "./Profile";
import HomePage from "./Home";

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState("3"); // Default to Calendar

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: "1", label: "Home" },
    { key: "2", label: "Tasks" },
    { key: "3", label: "Calendar" },
    { key: "4", label: "Profile" },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <HomePage />;
      case "2":
        return <TasksPage />;
      case "3":
        return (
          <CalendarComponent
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        );
      case "4":
        return <ProfilePage />;
      default:
        return <CalendarComponent />;
    }
  };

  return (
    <>
      <Breadcrumb
        style={{ margin: "16px 0" }}
        items={[
          { title: "Dashboard" },
          { title: menuItems.find((i) => i.key === selectedKey)?.label },
        ]}
      />
      <div
        style={{
          background: colorBgContainer,
          minHeight: 280,
          padding: 24,
          borderRadius: borderRadiusLG,
        }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default Dashboard;
