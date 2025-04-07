import React, { useState, useEffect } from "react";
import {
  Button,
  List,
  Modal,
  Input,
  Form,
  Upload,
  message,
  Divider,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "antd/dist/reset.css";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData).token : null;
    } catch (err) {
      console.error("❌ Failed to parse token from localStorage:", err);
      return null;
    }
  };

  const fetchNotes = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const sortedNotes = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setNotes(sortedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      message.error("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (values) => {
    const token = getToken();
    const file = values.file?.[0]?.originFileObj;

    if (!token || !file) {
      message.error("Please upload a valid file and ensure you're logged in");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subject", values.subject);
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        message.success("Note added successfully!");
        setIsModalVisible(false);
        form.resetFields();
        fetchNotes();
      } else {
        message.error(data.message || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      message.error("Error adding note");
    }
  };

  const confirmDeleteNote = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this note?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDeleteNote(id),
    });
  };

  const handleDeleteNote = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        message.success("Note deleted successfully!");
        fetchNotes(); // Refresh the notes list
      } else {
        message.error(data.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error("Error deleting note");
    }
  };

  const groupNotesByDate = (notes) => {
    return notes.reduce((groups, note) => {
      const date = moment(note.created_at).format("YYYY-MM-DD");
      if (!groups[date]) groups[date] = [];
      groups[date].push(note);
      return groups;
    }, {});
  };

  const groupedNotes = groupNotesByDate(notes);

  return (
    <div style={{ padding: 20 }}>
      <h1>Notes</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        Object.entries(groupedNotes).map(([date, notesForDate]) => (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <Divider orientation="left">
              {moment(date).format("MMMM D, YYYY")}
            </Divider>
            <List
              bordered
              dataSource={notesForDate}
              renderItem={(note) => {
                console.log("Rendering note:", note); // Move logging outside of JSX

                return (
                  <List.Item
                    key={note.id}
                    actions={[
                      <Popconfirm
                        title="Are you sure you want to delete this note?"
                        onConfirm={() => handleDeleteNote(note.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" danger size="small">
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <div>
                      <strong>{note.title}</strong>
                      <p style={{ marginBottom: 4 }}>{note.subject}</p>
                      <a
                        href={
                          note.file_path.startsWith("http")
                            ? note.file_path
                            : `http://localhost:5000/${note.file_path}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {note.file_path
                          ? decodeURIComponent(note.file_path.split("/").pop())
                          : "View File"}
                      </a>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        ))
      )}

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
          fontSize: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
            getValueFromEvent={(e) => e?.fileList || []}
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
