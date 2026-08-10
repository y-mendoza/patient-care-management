import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { getDocumentsByReference } from "../../../utils/firestoreCRUD";
import "./DailiesMedicine.css";

export default function DailiesMedicine() {
  const { user } = useAuth();
  const [upcomingMeds, setUpcomingMeds] = useState([]);
  const [takenMeds, setTakenMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchMeds = async () => {
      try {
        const medsData = await getDocumentsByReference(
          "dailyIntakeMonitor",
          "patient",
          "patients",
          user.uid
        );

        const now = new Date();

        const parsed = medsData.map((med) => {
          const dateTime =
            med.dateTime instanceof Timestamp
              ? med.dateTime.toDate()
              : null;

          const endDate =
            med.endDate instanceof Timestamp
              ? med.endDate.toDate()
              : null;

          return {
            id: med.id,
            name: med.medication || "Unknown",
            dosage: med.dosage || "-",
            frequency: med.frequency || "-",
            time: dateTime
              ? dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            status: med.status || "Not taken",
            endDate,
          };
        });

        // Separate upcoming (not taken) and completed (taken or expired)
        const upcoming = parsed.filter(
          (m) => m.status.toLowerCase() !== "taken" && (!m.endDate || m.endDate >= now)
        );

        const completed = parsed.filter(
          (m) => m.status.toLowerCase() === "taken" || (m.endDate && m.endDate < now)
        );

        setUpcomingMeds(upcoming);
        setTakenMeds(completed);
      } catch (err) {
        console.error("Error fetching daily meds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeds();
  }, [user]);

  if (loading) return <p className="loading">Loading daily medicines...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Daily Medicine Log</h1>

        {/* ─── Upcoming / Not Taken ───────────────────────── */}
        <div className="table-section">
          <h2 className="section-title">Upcoming / Not Taken</h2>
          {upcomingMeds.length === 0 ? (
            <p className="empty-message">No upcoming medicines.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingMeds.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.dosage}</td>
                    <td>{m.frequency}</td>
                    <td>{m.time}</td>
                    <td>
                      <span className="status pending">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ─── Completed / Taken ───────────────────────── */}
        <div className="table-section">
          <h2 className="section-title">Completed / Taken</h2>
          {takenMeds.length === 0 ? (
            <p className="empty-message">No completed medicines yet.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {takenMeds.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.dosage}</td>
                    <td>{m.frequency}</td>
                    <td>{m.time}</td>
                    <td>
                      <span className="status taken">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}