import React, { useEffect, useState, useContext } from "react";
import {
  List,
  Spin,
  Button,
  Popconfirm,
  message,
  Checkbox,
  Tag,
  Select,
  Input,
  Divider,
} from "antd";
import moment from "moment";
import { UserContext } from "../context/UserContext";

const { Option } = Select;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchTasks();
  }, [user, statusFilter, priorityFilter, search]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (priorityFilter !== "all") query.append("priority", priorityFilter);
      if (search) query.append("search", search);

      const queryString = query.toString();
      console.log("📦 Sending request with query:", queryString);

      const res = await fetch(
        `http://localhost:5000/api/tasks?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();
      console.log("📥 Response from server:", data);

      const today = moment().format("YYYY-MM-DD");
      const upcoming = data.filter((task) => task.due_date >= today);
      setTasks(upcoming);
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setTasks((prev) => prev.filter((task) => task.id !== id));
      message.success("Task deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete task.");
    }
  };

  const toggleCompletion = async (id, isCompleted) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ is_completed: !isCompleted }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      message.error("Could not update completion status");
    }
  };

  const groupTasksByDate = (tasks) => {
    return tasks.reduce((groups, task) => {
      const date = task.due_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
      return groups;
    }, {});
  };

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tasks</h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All</Option>
          <Option value="completed">Completed</Option>
          <Option value="incomplete">Incomplete</Option>
        </Select>

        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All Priorities</Option>
          <Option value="High">High</Option>
          <Option value="Medium">Medium</Option>
          <Option value="Low">Low</Option>
        </Select>

        <Input.Search
          placeholder="Search by title"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        Object.entries(groupedTasks).map(([date, tasksForDate]) => (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <Divider orientation="left">
              {moment(date).format("MMMM D, YYYY")}
            </Divider>
            <List
              bordered
              dataSource={tasksForDate}
              renderItem={(task) => (
                <List.Item
                  key={task.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: task.is_completed ? "#f6ffed" : "white",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Checkbox
                      checked={task.is_completed}
                      onChange={() =>
                        toggleCompletion(task.id, task.is_completed)
                      }
                    >
                      <span
                        style={{
                          textDecoration: task.is_completed
                            ? "line-through"
                            : "none",
                          color: task.is_completed ? "gray" : "inherit",
                        }}
                      >
                        {task.title}
                      </span>
                    </Checkbox>
                    <div>
                      <Tag
                        color={
                          task.priority === "High"
                            ? "red"
                            : task.priority === "Medium"
                            ? "orange"
                            : "blue"
                        }
                      >
                        {task.priority}
                      </Tag>
                    </div>
                  </div>

                  <Popconfirm
                    title="Are you sure to delete this task?"
                    onConfirm={() => handleDelete(task.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger size="small">
                      Delete
                    </Button>
                  </Popconfirm>
                </List.Item>
              )}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default Tasks;
