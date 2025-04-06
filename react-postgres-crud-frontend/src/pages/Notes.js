import React, { useState, useEffect } from "react";
import { Button, List, Modal, Input, Form, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed.token;
    } catch (err) {
      console.error("❌ Failed to parse token from localStorage:", err);
      return null;
    }
  };

  const fetchNotes = async () => {
    const token = getToken();
    console.log("📦 [fetchNotes] Retrieved token:", token);
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (values) => {
    const token = getToken();
    if (!token) {
      message.error("User not authenticated");
      return;
    }

    const file = values.file?.[0]?.originFileObj;

    console.log("🧪 [handleAddNote] Title:", values.title);
    console.log("🧪 [handleAddNote] Subject:", values.subject);
    console.log("🧪 [handleAddNote] File:", file);

    if (!file) {
      console.error("❌ No file attached");
      message.error("Please upload a valid file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subject", values.subject);
      formData.append("file", file);

      console.log("📦 [handleAddNote] FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(`🔹 ${key}:`, value);
      }

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type not needed with FormData
        },
        body: formData,
      });

      const data = await res.json();
      console.log("📬 [handleAddNote] Server response:", data);

      if (res.ok) {
        message.success("Note added successfully!");
        setIsModalVisible(false);
        form.resetFields();
        fetchNotes();
      } else {
        console.error("❌ Failed to add note:", data);
        message.error(data.message || "Failed to add note");
      }
    } catch (error) {
      console.error("❌ Error adding note:", error);
      message.error("Error adding note");
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
                href={`http://localhost:5000/${note.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {note.file_path.split("/").pop()}
              </a>
            </div>
          </List.Item>
        )}
      />

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

      <Modal
        title="Add New Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddNote} layout="vertical">
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
            rules={[{ required: true, message: "Please enter the subject" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="File"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              console.log("📂 Upload Event:", e);
              return e?.fileList || [];
            }}
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;
