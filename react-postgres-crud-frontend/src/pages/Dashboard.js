import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Breadcrumb, theme } from "antd";
import CalendarComponent from "../components/CalendarComponent";
import ProfilePage from "./Profile";
import HomePage from "./Home";
import TasksPage from "./Tasks";
import NotesPage from "./Notes"; // Import TasksPage

const Dashboard = () => {
  const { loading } = useContext(UserContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState("4"); // Default to Calendar
  const [breadcrumbExtra, setBreadcrumbExtra] = useState(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (loading) {
    return <p>Loading...</p>;
  }

  const menuItems = [
    { key: "1", label: "Home" },
    { key: "2", label: "Tasks" },
    { key: "3", label: "Notes" },
    { key: "4", label: "Calendar" },
    { key: "5", label: "Profile" },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <HomePage setBreadcrumbExtra={setBreadcrumbExtra} />;
      case "2":
        return <TasksPage setBreadcrumbExtra={setBreadcrumbExtra} />; // Render TasksPage
      case "3":
        return <NotesPage setBreadcrumbExtra={setBreadcrumbExtra} />; // Render TasksPage
      case "4":
        return (
          <CalendarComponent
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            setSelectedKey={setSelectedKey}
            setBreadcrumbExtra={setBreadcrumbExtra}
          />
        );
      case "5":
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
          ...(breadcrumbExtra ? [{ title: breadcrumbExtra }] : []),
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
