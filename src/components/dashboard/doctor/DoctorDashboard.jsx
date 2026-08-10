import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./DoctorDashboard.css";

// Safely convert Firestore Timestamp or string to JS Date
function parseDate(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Timestamp) return dateValue.toDate();
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch patients
        const userSnapshot = await getDocs(collection(db, "users"));
        const patientsData = userSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.role === "patient");
        setPatients(patientsData);

        // Fetch appointments for this doctor
        const doctorRef = doc(db, "users", user.uid);
        const apptQuery = query(collection(db, "appointments"), where("doctorId", "==", doctorRef));
        const snapshot = await getDocs(apptQuery);

        const data = await Promise.all(snapshot.docs.map(async (d) => {
          const appt = d.data();

          // Resolve patient name
          let patientName = "Unknown";
          let patientId = null;
          if (appt.patientId) {
            try {
              const patientSnap = await getDoc(appt.patientId);
              if (patientSnap.exists()) {
                const p = patientSnap.data();
                patientName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
                patientId = patientSnap.id;
              }
            } catch (err) {
              console.error("Error fetching patient:", err);
            }
          }

          return {
            id: d.id,
            patientName,
            patientId,
            dateTime: parseDate(appt.dateTime),
            type: appt.type || "",
            location: appt.location || "",
            notes: appt.notes || "",
            reason: appt.reason || "",
          };
        }));

        setAppointments(data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // Dates with appointments
  const appointmentDates = appointments
    .filter(a => a.dateTime)
    .map(a => a.dateTime.toDateString());

  const appointmentsForSelectedDay = appointments.filter(
    a => a.dateTime && a.dateTime.toDateString() === selectedDate.toDateString()
  );

  const getPatientName = (id) => {
    const patient = patients.find(p => p.id === id);
    return patient ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim() : "Unknown";
  };

  return (
    <div className="dashboard-container">
      {/* Patient Overview */}
      <div className="dashboard-card">
        <h2>Patient Overview</h2>
        <p>Active Patients: {patients.length}</p>
        <p>Pending Checkups: {Math.floor(patients.length / 4)}</p>
      </div>

      {/* Patients Table */}
      <div className="dashboard-card">
        <h2>Patients</h2>
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Appointments</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => {
              const patientAppts = appointments
                .filter(a => a.patientId === p.id)
                .map(a => a.dateTime ? a.dateTime.toLocaleDateString() : "N/A")
                .join(", ");
              return (
                <tr key={p.id}>
                  <td>{getPatientName(p.id)}</td>
                  <td>{patientAppts || "No appointments"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Appointment Calendar */}
      <div className="dashboard-card">
        <h2>Appointment Calendar</h2>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          tileClassName={({ date, view }) =>
            view === "month" && appointmentDates.includes(date.toDateString())
              ? "highlight-appointment"
              : null
          }
        />

        {appointmentsForSelectedDay.length > 0 ? (
          <ul>
            {appointmentsForSelectedDay.map(a => (
              <li key={a.id}>
                {a.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {a.patientName} ({a.type || "Checkup"})
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointments on this day.</p>
        )}
      </div>
    </div>
  );
}
