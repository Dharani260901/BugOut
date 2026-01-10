import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;
}
