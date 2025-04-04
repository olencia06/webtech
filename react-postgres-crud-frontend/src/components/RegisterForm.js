import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "./Auth.css"; // Import CSS for styling

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      await register(username, password);
      message.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      message.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-wrapper">
        <h1>Register</h1>
        <Form
          name="register_form"
          className="register-form"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return value && getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject("Passwords do not match!");
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
            <p>
              Already have an account?{" "}
              <a
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                Login now!
              </a>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterForm;
