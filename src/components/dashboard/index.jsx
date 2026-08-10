import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";

// Admin
import AdminDashboard from "./admin/AdminDashboard";

// Doctor
import DoctorDashboard from "./doctor/DoctorDashboard";
import DoctorNotifications from "./doctor/DoctorNotifications";
import DoctorProfile from "./doctor/DoctorProfile";
import DoctorAppointments from "./doctor/DoctorAppointments";
import PatientManagement from "./doctor/PatientManagement";

// Patient
import PatientDashboard from "./patient/PatientDashboard";
import DoctorNotifications from "./patient/PatientNotifications";
import PatientProfile from "./patient/PatientProfile";
import PatientAppointments from "./patient/PatientAppointments";
import DailiesFood from "./patient/DailiesFood";
import DailiesMedicine from "./patient/DailiesMedicine";

export default function DashboardRoutes() {
  const { profile } = useAuth();

  if (!profile) return <div>Loading dashboard...</div>;

  switch (profile.role) {
    case "Admin":
      return (
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );

    case "Doctor":
      return (
				<Routes>
					<Route path="/" element={<DoctorDashboard />} />
          <Route path="notifications" element={<DoctorNotifications />} />
					<Route path="appointments" element={<DoctorAppointments />} />
					<Route path="profile" element={<DoctorProfile />} />
					<Route path="/dashboard" element={<DoctorDashboard />} />
					<Route path="management" element={<Management />} />
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
					<Route path="patient-management/:id"element={<PatientManagement />}/>
				</Routes>
			);

    case "Patient":
      return (
        <Routes>
          <Route path="/" element={<PatientDashboard />} />
          <Route path="notifications" element={<PatientNotifications />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="dailies/food" element={<DailiesFood />} />
          <Route path="dailies/medicine" element={<DailiesMedicine />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );

    default:
      return <div>No dashboard available for your role.</div>;
  }
}