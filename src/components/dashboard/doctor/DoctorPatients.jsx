import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./DoctorPatients.css";

function calculateAge(dob) {
	if (!dob) return "N/A";
	const birthDate = new Date(dob);
	const diff = Date.now() - birthDate.getTime();
	const ageDate = new Date(diff);
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export default function DoctorPatients() {
	const [patients, setPatients] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "name",
		direction: "asc",
	});

	const navigate = useNavigate();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const user = auth.currentUser;
			if (!user) return;

			// Fetch all patients
			const userSnapshot = await getDocs(collection(db, "users"));
			const patientsData = userSnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.filter((u) => u.role === "patient");

			setPatients(patientsData);

			// Fetch all appointments
			const apptSnapshot = await getDocs(collection(db, "appointments"));
			const appointmentsData = apptSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setAppointments(appointmentsData);
		} catch (err) {
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	const getSortIndicator = (key) => {
		if (sortConfig.key === key) {
			return sortConfig.direction === "asc" ? " ▲" : " ▼";
		}
		return "";
	};

	const sortedPatients = [...patients].sort((a, b) => {
		if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
		if (!a[sortConfig.key]) return 1;
		if (!b[sortConfig.key]) return -1;

		let aValue = a[sortConfig.key];
		let bValue = b[sortConfig.key];

		if (sortConfig.key === "name") {
			aValue = `${a.first_name || a.firstName || ""} ${
				a.last_name || a.lastName || ""
			}`.toLowerCase();
			bValue = `${b.first_name || b.firstName || ""} ${
				b.last_name || b.lastName || ""
			}`.toLowerCase();
		} else if (sortConfig.key === "age") {
			aValue = calculateAge(a.birthDate);
			bValue = calculateAge(b.birthDate);
		} else if (sortConfig.key === "nextAppointment") {
			const aAppt = appointments
				.filter((appt) => appt.patientID === a.id && appt.dateTime)
				.map((appt) => new Date(appt.dateTime))
				.sort((x, y) => x - y)[0];
			const bAppt = appointments
				.filter((appt) => appt.patientID === b.id && appt.dateTime)
				.map((appt) => new Date(appt.dateTime))
				.sort((x, y) => x - y)[0];
			aValue = aAppt || new Date(8640000000000000);
			bValue = bAppt || new Date(8640000000000000);
		}

		if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
		if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
		return 0;
	});

	const filteredPatients = sortedPatients.filter((p) => {
		const fullName = `${p.first_name || p.firstName || ""} ${
			p.last_name || p.lastName || ""
		}`.toLowerCase();
		return fullName.includes(searchTerm.toLowerCase());
	});

	if (loading) return <p className="loading">Loading patients...</p>;

	return (
		<div className="patients-container">
			<div className="patients-header">
				<h2>Patients ({patients.length})</h2>
				<input
					type="text"
					placeholder="Search by name..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<table className="patients-table">
				<thead>
					<tr>
						<th onClick={() => handleSort("name")}>
							Name{getSortIndicator("name")}
						</th>
						<th onClick={() => handleSort("sex")}>
							Sex{getSortIndicator("sex")}
						</th>
						<th onClick={() => handleSort("age")}>
							Age{getSortIndicator("age")}
						</th>
						<th onClick={() => handleSort("nextAppointment")}>
							Next Appointment{getSortIndicator("nextAppointment")}
						</th>
						<th onClick={() => handleSort("currentConcern")}>
							Current Concern{getSortIndicator("currentConcern")}
						</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{filteredPatients.map((p) => {
						const patientAppointments = appointments
							.filter((a) => a.patientID === p.id && a.dateTime)
							.map((a) => new Date(a.dateTime))
							.sort((a, b) => a - b);
						const nextAppointment = patientAppointments[0]
							? patientAppointments[0].toLocaleDateString()
							: "N/A";

						return (
							<tr key={p.id}>
								<td>{`${p.first_name || p.firstName || ""} ${
									p.last_name || p.lastName || ""
								}`}</td>
								<td>{p.sex || p.gender || "N/A"}</td>
								<td>{calculateAge(p.birthDate)}</td>
								<td>{nextAppointment}</td>
								<td>{p.currentConcern || "N/A"}</td>
								<td>
									<button className="dashboard-button-blue" 
										onClick={() =>
											navigate(`/doctor/patient-management/${p.id}`)
										}>
										View Details
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
