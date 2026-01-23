import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    // 🔥 clear correct tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    console.log("Access token:", localStorage.getItem("accessToken"));
console.log("Token valid:", isTokenValid())

    return <Navigate to="/login" replace />;
  }

  return children;
}
