import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/Tasks";
import ProfilePage from "./pages/Profile";
import HomePage from "./pages/Home";
import LayoutWrapper from "./components/LayoutWrapper"; // Persistent nav/footer wrapper

function App() {
  const [user, setUser] = useState(null);

  // On app load, check for stored user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      setUser({ username });
    }
  }, []);

  // Protect routes
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<AuthForm setUser={setUser} />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Wrap protected pages inside LayoutWrapper to keep nav static */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWrapper user={user}>
                <Dashboard />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <LayoutWrapper user={user}>
                <TasksPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutWrapper user={user}>
                <ProfilePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 route */}
        <Route
          path="*"
          element={
            <h1 style={{ textAlign: "center" }}>404 - Page Not Found</h1>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
