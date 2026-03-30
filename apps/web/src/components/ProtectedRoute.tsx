import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "@/shared/lib/auth";

const ProtectedRoute = () => {
  const isAuthenticated = getToken() !== null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
