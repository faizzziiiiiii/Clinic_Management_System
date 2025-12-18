import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict role check
  if (!roles.includes(user.role)) {
    localStorage.setItem("accessDenied", "true"); // Set flag
    return <Navigate to="/login" replace />;
  }

  return children;
}
