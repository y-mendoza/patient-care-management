import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../components/AuthContext";
import { getMessaging, getToken } from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../firebase/firebaseConfig";
import { sendNotification } from "../../../utils/notifications";
import "./DoctorAppointments.css";

/** Safely parse Firestore timestamps or strings */
function parseDateTime(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Timestamp) return dateValue.toDate();
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingAppointmentID, setEditingAppointmentID] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchAppointments(user.uid.trim());
      fetchPatients();
    } else {
      console.warn("User UID not available yet.");
      setLoading(false);
    }
  }, [user]);

  /** Fetch appointments for this doctor (using doctorId reference) */
  const fetchAppointments = async (doctorUID) => {
    try {
      const doctorRef = doc(db, "users", doctorUID);
      const q = query(collection(db, "appointments"), where("doctorId", "==", doctorRef)); // ✅ FIXED
      const snapshot = await getDocs(q);

      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const appt = { id: docSnap.id, ...docSnap.data() };
          let patientName = "Unknown";

          // Resolve patient reference
          if (appt.patientId) { // ✅ FIXED
            try {
              const patientSnap = await getDoc(appt.patientId); // ✅ FIXED
              if (patientSnap.exists()) {
                const p = patientSnap.data();
                patientName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
              }
            } catch (err) {
              console.error("Error fetching patient:", err);
            }
          }

          return { ...appt, patientName };
        })
      );

      setAppointments(data);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch all patients */
  const fetchPatients = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.role === "patient");
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  /** Populate form for editing */
  const handleEditAppointment = (appt) => {
    setEditingAppointmentID(appt.id);
    setSelectedPatient(appt.patientId?.id || ""); // ✅ FIXED (use patientId ref)
    setDate(appt.dateTime ? parseDateTime(appt.dateTime).toISOString().split("T")[0] : "");
    setTime(appt.dateTime ? parseDateTime(appt.dateTime).toTimeString().slice(0, 5) : "");
    setType(appt.type || "");
    setReason(appt.reason || "");
    setLocation(appt.location || "");
    setNotes(appt.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Delete appointment */
  const handleDeleteAppointment = async (appointmentID) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const apptRef = doc(db, "appointments", appointmentID);
      const apptSnap = await getDoc(apptRef);
      const apptData = apptSnap.exists() ? apptSnap.data() : null;
      const patientId = apptData?.patientId?.id;
      await deleteDoc(apptRef);
      fetchAppointments(user.uid);
      if (patientId) {
        await sendNotification(
          patientId,
          "Appointment Cancelled",
          "Your recent appointment has been cancelled by your doctor."
        );
      }
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  /** Add or Update appointment (using doctorId/patientId references) */
  const handleAddOrUpdateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !date || !time) return alert("Fill all required fields");

    setSubmitting(true);
    try {
      const [year, month, day] = date.split("-");
      const [hours, minutes] = time.split(":").map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes);

      const doctorRef = doc(db, "users", user.uid);
      const patientRef = doc(db, "users", selectedPatient);

      const data = {
        doctorId: doctorRef,
        patientId: patientRef,
        dateTime: Timestamp.fromDate(dateTime),
        type: type || "",
        reason: reason || "",
        location: location || "",
        notes: notes || "",
        updatedAt: serverTimestamp(),
      };

      if (editingAppointmentID) {
        await updateDoc(doc(db, "appointments", editingAppointmentID), data);
        await sendNotification(
        selectedPatient,
        "Appointment Updated",
        "Your appointment details have been updated by your doctor."
      );
        setEditingAppointmentID(null);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "appointments"), data);

        await sendNotification(
        selectedPatient,
        "New Appointment Scheduled",
        "Your doctor has scheduled a new appointment with you."
      );
      }

      fetchAppointments(user.uid);

      // Reset form
      setSelectedPatient("");
      setDate("");
      setTime("");
      setType("");
      setReason("");
      setLocation("");
      setNotes("");
    } catch (err) {
      console.error("Error saving appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading appointments...</p>;

  return (
    <div className="dashboard-container">
      {/* Scrollable Appointments Table */}
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <div className="dashboard-card table-container">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Location</th>
                <th>Patient</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => {
                const dateObj = parseDateTime(appt.dateTime);
                return (
                  <tr key={appt.id}>
                    <td>{dateObj ? dateObj.toLocaleString() : "Invalid Date"}</td>
                    <td>{appt.type || "—"}</td>
                    <td>{appt.reason || "—"}</td>
                    <td>{appt.location || "—"}</td>
                    <td>{appt.patientName}</td>
                    <td>{appt.notes || "N/A"}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn full-width-btn"
                        onClick={() => handleEditAppointment(appt)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn full-width-btn"
                        onClick={() => handleDeleteAppointment(appt.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Appointment Form */}
      <div className="dashboard-card add-appointment">
        <h3>{editingAppointmentID ? "Edit Appointment" : "Add Appointment"}</h3>
        <form className="add-appointment-form" onSubmit={handleAddOrUpdateAppointment}>
          <div className="form-row">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-row">
            <button type="submit" disabled={submitting}>
              {submitting
                ? editingAppointmentID
                  ? "Updating..."
                  : "Adding..."
                : editingAppointmentID
                ? "Update Appointment"
                : "Add Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
