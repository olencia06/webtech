import React, { useState, useEffect } from "react";
import { Button, List, Modal, Input, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons"; // Import PlusOutlined icon

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch notes from the backend
  const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notes"); // Your API endpoint
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes(); // Fetch notes when the component is mounted
  }, []);

  const handleAddNote = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subject", values.subject);
      formData.append("file", values.file[0]); // Append the file

      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        body: formData, // Send as FormData (no headers needed for multipart)
      });

      if (response.ok) {
        message.success("Note added successfully!");
        setIsModalVisible(false);
        fetchNotes(); // Refresh the list
        form.resetFields();
      } else {
        message.error("Failed to add note");
      }
    } catch (error) {
      message.error("Error adding note");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <List
        bordered
        dataSource={notes}
        renderItem={(note) => (
          <List.Item>
            <div>
              <strong>{note.title}</strong>
              <p>{note.subject}</p>
              <a
                href={note.file_path}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download File
              </a>
            </div>
          </List.Item>
        )}
      />

      {/* Floating action button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          padding: 0,
          fontSize: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      />

      {/* Modal for adding notes */}
      <Modal
        title="Add New Note"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddNote}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter the note title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[
              { required: true, message: "Please enter the note subject" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="File"
            name="file"
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <Input type="file" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;
