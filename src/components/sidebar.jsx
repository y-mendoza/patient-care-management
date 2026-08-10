  import PatientSidebar from "./sidebar/PatientSidebar";
  import DoctorSidebar from "./sidebar/DoctorSidebar";
  import AdminSidebar from "./sidebar/AdminSidebar";
  import "./sidebar.css";

  export default function Sidebar({ role }) {
    switch (role) {
      case "Patient":
        return <PatientSidebar />;
      case "Doctor":
        return <DoctorSidebar />;
      case "Admin":
        return <AdminSidebar />;
      default:
        return <p>No sidebar available for this role.</p>;
    }
  }