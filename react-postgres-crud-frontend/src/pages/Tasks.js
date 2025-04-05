import React, { useEffect, useState } from "react";
import { List, Spin } from "antd";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        const tasksData = await res.json();

        // Ensure tasksData is an array
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        } else {
          console.error("Tasks data is not an array:", tasksData);
          setTasks([]); // Fallback if it's not an array
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]); // Handle the error gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h1>All Tasks</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={tasks} // Ensure tasks is an array
          renderItem={(task) => (
            <List.Item>
              <List.Item.Meta
                title={task.title}
                description={`Due: ${task.due_date} - ${task.priority}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Tasks;
