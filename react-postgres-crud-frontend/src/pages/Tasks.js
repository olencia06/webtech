import React, { useEffect, useState, useContext } from "react";
import { List, Spin } from "antd";
import moment from "moment";
import { UserContext } from "../context/UserContext";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        const today = moment().format("YYYY-MM-DD");
        const upcoming = data.filter((task) => task.due_date >= today);

        setTasks(upcoming);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tasks</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          bordered
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item key={task.id} style={{ cursor: "pointer" }}>
              ⏳ {task.title} - {moment(task.due_date).format("MMM D")}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Tasks;
