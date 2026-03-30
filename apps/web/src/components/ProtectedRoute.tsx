import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const hasRefreshToken = document.cookie.includes("refreshToken");
  return hasRefreshToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
