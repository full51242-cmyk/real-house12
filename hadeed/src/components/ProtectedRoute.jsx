import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) return false;
    if (!storedUser || storedUser === "undefined" || storedUser === "null") return false;

    try {
      const parsedUser = JSON.parse(storedUser);
      return Boolean(parsedUser && parsedUser.email);
    } catch {
      return false;
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}
