import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "@/shared/lib/auth";

const PublicRoute = () => {
  const isAuthenticated = getToken() !== null;

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

