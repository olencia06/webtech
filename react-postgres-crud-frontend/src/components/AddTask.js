import React, { useState } from "react";
import { Form, Input, DatePicker, Select, Button, message } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const AddTask = ({ onTaskAdd }) => {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);

    const token = localStorage.getItem("authToken"); // Adjust the token key if necessary

    if (!token) {
      message.error("You must be logged in to add a task");
      setLoading(false);
      return;
    }

    const newTask = {
      title: values.title,
      description: values.description,
      due_date: values.dueDate.format("YYYY-MM-DD"),
      priority: values.priority,
    };

    // Debugging: Log the task and the token
    console.log("New Task:", newTask);
    console.log("Token:", token);

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if using JWT
        },
        body: JSON.stringify(newTask),
      });

      // Debugging: Log the response
      console.log("Response Status:", res.status);
      const result = await res.json();

      if (!res.ok) {
        console.error("Error response:", result); // Log the error message
        throw new Error(result.message || "Failed to add task");
      }

      // Debugging: Log the result
      console.log("Task Added Successfully:", result);
      onTaskAdd(result); // Update task list in parent component
      message.success("Task added successfully!");
    } catch (err) {
      console.error("Error:", err); // Log the error stack
      message.error("Something went wrong while adding the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Task title" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Details about the task" />
        </Form.Item>

        <Form.Item
          label="Due Date"
          name="dueDate"
          rules={[{ required: true, message: "Please pick a due date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(date) => date < dayjs().startOf("day")}
          />
        </Form.Item>

        <Form.Item label="Priority" name="priority" initialValue="Medium">
          <Select>
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Add Task
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddTask;
