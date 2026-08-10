import React from "react";
import { useAuth } from "../../AuthContext";
import AdminDashboard from "./dashboard/admin/AdminDashboard-alt";
import DoctorDashboard from "./dashboard/doctor/DoctorDashboard";
import PatientDashboard from "./dashboard/patient/PatientDashboard";
import "./dashboard_global.css";

export default function Dashboard() {
  const { profile, user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user || !profile) {
    return <p>No user data available.</p>;
  }

  const role = profile.role?.toLowerCase();

  switch (role) {
    case "admin":
      return <AdminDashboard userData={profile} />;
    case "doctor":
      return <DoctorDashboard userData={profile} />;
    case "patient":
      return <PatientDashboard userData={profile} />;
    default:
      return <p>No dashboard available for this role.</p>;
  }
}