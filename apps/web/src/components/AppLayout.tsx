import { Outlet } from "react-router-dom";
import Sidebar from "@/shared/components/layout/sidebar";

const AppLayout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
