import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "./Auth.css"; // Import CSS for styling

const AuthForm = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      const response = await login(username, password);

      const user = {
        token: response.data.token,
        username: response.data.user?.username || username,
        id: response.data.user?.id,
      };

      // 💾 Save token in localStorage for later use (AddTask needs this!)
      localStorage.setItem("authToken", response.data.token);

      // Update global context
      setUser(user);
      message.success("Login successful!");

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-wrapper">
        <h1>Login</h1>
        <Form name="login_form" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a className="login-form-forgot" href="#">
              Forgot password?
            </a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
            <p>
              Don't have an account?{" "}
              <a
                onClick={() => navigate("/register")}
                style={{ cursor: "pointer" }}
              >
                Register now!
              </a>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AuthForm;
