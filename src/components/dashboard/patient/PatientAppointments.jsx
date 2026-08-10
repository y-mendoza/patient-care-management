import React, { useEffect, useState } from "react";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../AuthContext";
import "./PatientAppointments.css";

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely parse Firestore Timestamp
  const parseDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        if (!user?.uid) return;

        // Reference to patient document
        const patientRef = doc(db, "users", user.uid);

        // Query appointments for this patient
        const q = query(collection(db, "appointments"), where("patientId", "==", patientRef));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const apptDoc = snapshot.docs[0];
          const apptData = { id: apptDoc.id, ...apptDoc.data() };
          setAppointment(apptData);

          // Fetch doctor info
          if (apptData.doctorId) {
            try {
              // Step 1: fetch doctor user document
              const doctorUserSnap = await getDoc(apptData.doctorId);
              if (!doctorUserSnap.exists()) return;

              const userData = { id: doctorUserSnap.id, ...doctorUserSnap.data() };

              // Step 2: fetch doctor profile from /doctors by uid field
              const doctorQuery = query(
                collection(db, "doctors"),
                where("uid", "==", doctorUserSnap.id)
              );
              const doctorSnap = await getDocs(doctorQuery);
              const profileData = !doctorSnap.empty ? doctorSnap.docs[0].data() : {};

              // Merge both user + profile data
              setDoctor({ ...userData, ...profileData });
            } catch (err) {
              console.error("Error fetching doctor details:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [user]);

  if (loading) return <div className="appointment-loading">Loading...</div>;

  if (!appointment || !doctor) {
    return (
      <div className="appointment-container">
        <h2>No upcoming appointments found.</h2>
      </div>
    );
  }

  // Safely handle Firestore Timestamp
  const date = parseDate(appointment.dateTime)?.toLocaleDateString() || "N/A";
  const time =
    parseDate(appointment.dateTime)?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) || "N/A";

  return (
    <div className="appointment-container">
      <h1>Appointments</h1>

      <div className="appointment-card">
        <h2>Assigned Doctor</h2>
        <p>
          <strong>
            Dr. {doctor.fullName || `${doctor.firstName || ""} ${doctor.lastName || ""}`}
          </strong>
        </p>
        <p>
          <strong>Field:</strong> {doctor.medicalField || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {doctor.email || "N/A"}
        </p>
        <p>
          <strong>Contact Number:</strong> {doctor.officeContactNo || "N/A"}
        </p>
        <p>
          <strong>Hospital Address & Office:</strong>{" "}
          {doctor.placeOfEmployment || "N/A"}, Room {doctor.officeRoomNo || "N/A"},{" "}
          {doctor.officeAddress || "N/A"}
        </p>

        <hr className="appointment-divider" />

        <h2>Upcoming Appointment Details</h2>
        <p>
          <strong>Time:</strong> {time}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Location:</strong> {appointment.location || "N/A"}
        </p>
        <p>
          <strong>Type:</strong> {appointment.type || "N/A"}
        </p>
        <p>
          <strong>Reason:</strong> {appointment.reason || "N/A"}
        </p>

        <p className="appointment-note">
          To reschedule, please contact your assigned doctor.
        </p>
      </div>
    </div>
  );
}
