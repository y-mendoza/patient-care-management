import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useParams } from "react-router-dom";
import "./PatientManagement.css";

export default function PatientManagement() {
  const params = useParams();
  // Handle different possible parameter names from the route
  const patientId = params.patientId || params.id || params.userId;
  
  const [patientData, setPatientData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        console.log("All params:", params);
        console.log("Fetching data for patientId:", patientId);
        
        // Fetch user document first
        const userDoc = await getDoc(doc(db, "users", patientId));
        console.log("User document exists:", userDoc.exists());
        
        if (userDoc.exists()) {
          const userDataFromDoc = userDoc.data();
          console.log("User data:", userDataFromDoc);
          setUserData(userDataFromDoc);
        } else {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Try to find patient document
        const userRef = doc(db, "users", patientId);
        console.log("Querying patients collection with userRef:", userRef.path);
        
        const patientQuery = query(
          collection(db, "patients"),
          where("uid", "==", userRef)
        );
        const patientSnapshot = await getDocs(patientQuery);
        console.log("Patient snapshot empty:", patientSnapshot.empty);
        console.log("Patient docs found:", patientSnapshot.docs.length);
        
        let patientDocId = null;
        if (!patientSnapshot.empty) {
          const patData = patientSnapshot.docs[0].data();
          patientDocId = patientSnapshot.docs[0].id;
          console.log("Patient data:", patData);
          console.log("Patient doc ID:", patientDocId);
          setPatientData(patData);
        } else {
          console.warn("No patient document found for this user");
        }

        // Fetch prescriptions
        if (patientDocId) {
          try {
            const patientDocRef = doc(db, "patients", patientDocId);
            const prescQuery = query(
              collection(db, "prescriptions"),
              where("patientId", "==", patientDocRef)
            );
            const prescSnapshot = await getDocs(prescQuery);
            console.log("Prescriptions found:", prescSnapshot.docs.length);
            
            const prescData = prescSnapshot.docs.map(d => ({
              id: d.id,
              ...d.data()
            }));
            setPrescriptions(prescData);
          } catch (prescErr) {
            console.error("Error fetching prescriptions:", prescErr);
          }
        }

        // Fetch appointments - try multiple approaches
        try {
          // Get ALL appointments first to see what we're working with
          const allApptSnapshot = await getDocs(collection(db, "appointments"));
          console.log("Total appointments in DB:", allApptSnapshot.docs.length);
          
          // Filter manually to see what matches
          const allAppointments = allApptSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
          
          console.log("Sample appointment data:", allAppointments[0]);
          
          // Try to match by checking if patientID contains our user ID
          const matchingAppts = allAppointments.filter(appt => {
            const pid = appt.patientID;
            console.log("Checking patientID:", pid, "Type:", typeof pid);
            
            // Check if it's a reference object
            if (pid && pid.path) {
              console.log("PatientID has path:", pid.path);
              return pid.path.includes(patientId);
            }
            // Check if it's a string path
            if (typeof pid === 'string') {
              return pid.includes(patientId) || pid === patientId;
            }
            return false;
          });
          
          console.log("Matching appointments:", matchingAppts.length);
          setAppointments(matchingAppts);
        } catch (apptErr) {
          console.error("Error fetching appointments:", apptErr);
        }

      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(`Failed to load patient data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    } else {
      console.error("No patientId provided");
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      let date;
      // Check if it's a Firestore Timestamp
      if (dateString.toDate && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
      } else if (dateString.seconds) {
        // Firestore Timestamp object with seconds
        date = new Date(dateString.seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      let date;
      // Check if it's a Firestore Timestamp
      if (dateString.toDate && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
      } else if (dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "N/A";
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading patient data...</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Patient ID: {patientId}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>Patient ID: {patientId}</p>
        <p style={{ fontSize: '12px' }}>Check console for details</p>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="error-message">
        <p>No patient data found.</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>Patient ID: {patientId}</p>
      </div>
    );
  }

  return (
    <div className="patient-management-container">
      <h2 className="page-title">Patient Management</h2>

      <div className="content-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Prescriptions Card */}
          <div className="card prescriptions-card">
            <h3 className="card-title">Prescriptions</h3>
            <div className="prescriptions-list">
              {prescriptions.length > 0 ? (
                prescriptions.map((presc) => (
                  <div key={presc.id} className="prescription-item">
                    <div className="presc-header">
                      <strong>{presc.medicationName || presc.medication || "Medication"}</strong>
                      {presc.frequency && <span className="frequency-badge">↑</span>}
                    </div>
                    <div className="presc-details">
                      {presc.dosage && <div>{presc.dosage}</div>}
                      {presc.frequency && <div>{presc.frequency}</div>}
                      {presc.duration && <div>Duration: {presc.duration}</div>}
                      {presc.instructions && <div className="instructions">{presc.instructions}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No prescriptions found</p>
              )}
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="card patient-info-card">
            <h3 className="info-label">Patient Information</h3>
            <div className="info-content">
              <p><strong>Patient Name:</strong> {userData.firstName || userData.first_name || "N/A"} {userData.lastName || userData.last_name || ""}</p>
              <p><strong>E-mail Address:</strong> {userData.email || "N/A"}</p>
              <p><strong>Contact Number:</strong> {userData.contactNumber || userData.contact_number || "N/A"}</p>
              <br />
              <p><strong>Age:</strong> {calculateAge(userData.birthDate || userData.birth_date)}</p>
              <p><strong>Gender:</strong> {userData.gender || userData.sex || "N/A"}</p>
              <p><strong>Date of Birth:</strong> {formatDate(userData.birthDate || userData.birth_date)}</p>
              {patientData && (
                <>
                  <p><strong>Chronic Condition/s:</strong> {patientData.chronicIllness?.join(", ") || "None"}</p>
                  <p><strong>Allergies:</strong> {patientData.allergies?.join(", ") || "None"}</p>
                  <br />
                  <p><strong>Insurance Provider:</strong> {patientData.insuranceProvider || "N/A"}</p>
                  <p><strong>Senior Citizen:</strong> {patientData.seniorCitizenStatus ? "Yes" : "No"}</p>
                  <p><strong>PWD:</strong> {patientData.pwdStatus ? "Yes" : "No"}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Meals Card */}
          <div className="card meals-card">
            <h3 className="card-title">Meals</h3>
            <div className="meals-content">
              <p className="no-data">No meal data available</p>
            </div>
          </div>

          {/* Appointment Card */}
          <div className="card appointment-card">
            <h3 className="card-title">Appointment</h3>
            <div className="appointment-content">
              {appointments.length > 0 ? (
                appointments
                  .filter(appt => appt.dateTime || appt.appointmentDate)
                  .sort((a, b) => {
                    let dateA, dateB;
                    
                    // Handle Firestore Timestamps
                    const dateFieldA = a.dateTime || a.appointmentDate;
                    const dateFieldB = b.dateTime || b.appointmentDate;
                    
                    if (dateFieldA?.toDate) {
                      dateA = dateFieldA.toDate();
                    } else if (dateFieldA?.seconds) {
                      dateA = new Date(dateFieldA.seconds * 1000);
                    } else {
                      dateA = new Date(dateFieldA);
                    }
                    
                    if (dateFieldB?.toDate) {
                      dateB = dateFieldB.toDate();
                    } else if (dateFieldB?.seconds) {
                      dateB = new Date(dateFieldB.seconds * 1000);
                    } else {
                      dateB = new Date(dateFieldB);
                    }
                    
                    return dateA - dateB;
                  })
                  .slice(0, 3)
                  .map((appt) => (
                    <div key={appt.id} className="appointment-item">
                      <p><strong>Date:</strong> {formatDate(appt.dateTime || appt.appointmentDate)}</p>
                      <p><strong>Time:</strong> {formatTime(appt.dateTime || appt.appointmentDate)}</p>
                      <p><strong>Status:</strong> {appt.status || appt.type || "Scheduled"}</p>
                      {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}
                      {appt.location && <p><strong>Location:</strong> {appt.location}</p>}
                    </div>
                  ))
              ) : (
                <p className="no-scheduled">No Scheduled Appointment</p>
              )}
            </div>
          </div>

          {/* Medical History Card */}
          <div className="card medical-history-card">
            <h3 className="card-title">Medical History</h3>
            <div className="history-content">
              {patientData?.chronicIllness && patientData.chronicIllness.length > 0 ? (
                <>
                  {patientData.chronicIllness.map((condition, index) => (
                    <p key={index} className="history-item">
                      • Patient has been diagnosed with {condition}.
                    </p>
                  ))}
                </>
              ) : (
                <p className="history-item">• No chronic conditions recorded.</p>
              )}
              <br />
              <h4>Surgical History</h4>
              {patientData?.surgicalHistory ? (
                <p className="history-item">• {patientData.surgicalHistory}</p>
              ) : (
                <p className="history-item">• N/A</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}