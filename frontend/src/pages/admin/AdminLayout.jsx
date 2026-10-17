import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminHeader from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";

import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminHeader onMenuClick={() => setSidebarOpen((open) => !open)} />
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close admin navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;