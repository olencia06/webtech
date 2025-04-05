import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import AuthForm from "./components/AuthForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/Tasks";
import ProfilePage from "./pages/Profile";
import NotesPage from "./pages/Notes";
import LayoutWrapper from "./components/LayoutWrapper";
import { UserContext } from "./context/UserContext";

function App() {
  const { user, setUser, loading } = useContext(UserContext);

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  if (loading) return <div>Loading...</div>; // Show a loading state

  return (
    <Router>
      <Routes>
        {/* Redirect root to login if no user, otherwise to dashboard/home */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        <Route path="/login" element={<AuthForm setUser={setUser} />} />
        <Route path="/register" element={<RegisterForm />} />

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
          path="/notes"
          element={
            <ProtectedRoute>
              <LayoutWrapper user={user}>
                <NotesPage />
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
