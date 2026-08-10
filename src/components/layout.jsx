// src/components/layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Sidebars
import AdminSidebar from "./sidebar/AdminSidebar";
import DoctorSidebar from "./sidebar/DoctorSidebar";
import PatientSidebar from "./sidebar/PatientSidebar";
import HeaderBar from "./start/navbar";

export default function Layout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  const role = profile?.role || null;

  let sidebar = null;

  if (role === "admin" && location.pathname.startsWith("/admin")) {
    sidebar = <AdminSidebar />;
  } else if (role === "doctor" && location.pathname.startsWith("/doctor")) {
    sidebar = <DoctorSidebar />;
  } else if (role === "patient" && location.pathname.startsWith("/patient")) {
    sidebar = <PatientSidebar />;
  }

  const showHeader = !sidebar;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar (fixed width for dashboard pages) */}
      {sidebar && (
        <div
          style={{
            width: "250px",
            flexShrink: 0,
          }}
        >
          {sidebar}
        </div>
      )}

      {/* Main content area */}
      <div style={{ flexGrow: 1 }}>
        {showHeader && <HeaderBar />}
        <Outlet />
      </div>
    </div>
  );
}