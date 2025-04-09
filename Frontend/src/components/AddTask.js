import React, { useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, message } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const AddTask = ({ onTaskAdd, existingTask, defaultDate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (existingTask) {
      form.setFieldsValue({
        title: existingTask.title,
        description: existingTask.description,
        priority: existingTask.priority,
        due_date: dayjs(existingTask.due_date),
      });
    } else {
      form.resetFields();
      const fillDate = defaultDate ? dayjs(defaultDate) : dayjs();
      form.setFieldsValue({ due_date: fillDate });
    }
  }, [existingTask, defaultDate]);

  const handleFinish = async (values) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      message.error("User not authenticated. Token not found.");
      return;
    }

    const taskData = {
      ...values,
      due_date: values.due_date.format("YYYY-MM-DD"),
    };

    try {
      let res;
      if (existingTask) {
        res = await fetch(
          `http://localhost:5000/api/tasks/${existingTask.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(taskData),
          }
        );
      } else {
        res = await fetch("http://localhost:5000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server error response:", errorText);
        throw new Error("Failed to save task");
      }

      const result = await res.json();
      message.success(existingTask ? "Task updated!" : "Task added!");
      onTaskAdd(result);
      form.resetFields();
    } catch (error) {
      message.error("Something went wrong.");
      console.error("❗ Task save error:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        due_date: defaultDate ? dayjs(defaultDate) : dayjs(),
      }}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <TextArea rows={3} placeholder="Enter task description" />
      </Form.Item>

      <Form.Item
        label="Priority"
        name="priority"
        rules={[{ required: true, message: "Please select a priority" }]}
      >
        <Select placeholder="Select priority">
          <Option value="Low">Low</Option>
          <Option value="Medium">Medium</Option>
          <Option value="High">High</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Due Date"
        name="due_date"
        rules={[{ required: true, message: "Please pick a due date" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          disabledDate={(date) => date < dayjs().startOf("day")}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {existingTask ? "Update Task" : "Add Task"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddTask;
