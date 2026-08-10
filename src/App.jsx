import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Start Pages ─────────────────────
import Home from "./components/start/home";
import Login from "./components/start/login";
import AboutUs from "./components/start/aboutus";
import Contact from "./components/start/contact";

// ─── Dashboard Pages ─────────────────
import AdminDashboard from "./components/dashboard/admin/AdminDashboard";

import DoctorDashboard from "./components/dashboard/doctor/DoctorDashboard";
import DoctorNotifications from "./components/dashboard/doctor/DoctorNotifications";
import DoctorPatients from "./components/dashboard/doctor/DoctorPatients";
import DoctorAppointments from "./components/dashboard/doctor/DoctorAppointments";
import DoctorProfile from "./components/dashboard/doctor/DoctorProfile";
import PatientManagement from "./components/dashboard/doctor/PatientManagement";

import PatientDashboard from "./components/dashboard/patient/PatientDashboard";
import PatientNotifications from "./components/dashboard/patient/PatientNotifications";
import PatientAppointments from "./components/dashboard/patient/PatientAppointments";
import PatientProfile from "./components/dashboard/patient/PatientProfile";
import DailiesFood from "./components/dashboard/patient/DailiesFood";
import DailiesMedicine from "./components/dashboard/patient/DailiesMedicine";

export default function App() {
  return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Shared Layout */}
					<Route path="/" element={<Layout />}>
						{/* Public Pages */}
						<Route index element={<Home />} />
						<Route path="login" element={<Login />} />
						<Route path="about" element={<AboutUs />} />
						<Route path="contact" element={<Contact />} />

						{/* Admin */}
						<Route
							path="admin/dashboard"
							element={
								<ProtectedRoute>
									<AdminDashboard />
								</ProtectedRoute>
							}
						/>

						{/* Doctor */}
						<Route
							path="doctor/dashboard"
							element={
								<ProtectedRoute>
									<DoctorDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="doctor/notifications"
							element={
								<ProtectedRoute>
									<DoctorNotifications />
								</ProtectedRoute>
							}
						/>
						<Route
							path="doctor/patients"
							element={
								<ProtectedRoute>
									<DoctorPatients />
								</ProtectedRoute>
							}
						/>
						<Route
							path="doctor/patient-management/:id"
							element={
								<ProtectedRoute>
									<PatientManagement />
								</ProtectedRoute>
							}
						/>
						<Route
							path="doctor/appointments"
							element={
								<ProtectedRoute>
									<DoctorAppointments />
								</ProtectedRoute>
							}
						/>
						<Route
							path="doctor/profile"
							element={
								<ProtectedRoute>
									<DoctorProfile />
								</ProtectedRoute>
							}
						/>

						{/* Patient */}
						<Route
							path="patient/dashboard"
							element={
								<ProtectedRoute>
									<PatientDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="patient/notifications"
							element={
								<ProtectedRoute>
									<PatientNotifications />
								</ProtectedRoute>
							}
						/>
						<Route
							path="patient/appointments"
							element={
								<ProtectedRoute>
									<PatientAppointments />
								</ProtectedRoute>
							}
						/>
						<Route
							path="patient/dailies/food"
							element={
								<ProtectedRoute>
									<DailiesFood />
								</ProtectedRoute>
							}
						/>
						<Route
							path="patient/dailies/medicine"
							element={
								<ProtectedRoute>
									<DailiesMedicine />
								</ProtectedRoute>
							}
						/>
						<Route
							path="patient/profile"
							element={
								<ProtectedRoute>
									<PatientProfile />
								</ProtectedRoute>
							}
						/>
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
}