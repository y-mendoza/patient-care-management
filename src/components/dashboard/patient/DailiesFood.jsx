import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { getDocumentsByReference } from "../../../utils/firestoreCRUD";
import "./DailiesFood.css";

export default function DailiesFood() {
  const { user } = useAuth();
  const [upcomingFoods, setUpcomingFoods] = useState([]);
  const [completedFoods, setCompletedFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchFoods = async () => {
      try {
        const foodsData = await getDocumentsByReference(
          "dailyFoodLog", // change if your collection name differs
          "patient",
          "patients",
          user.uid
        );

        const now = new Date();

        const parsed = foodsData.map((f) => {
          const dateTime =
            f.dateTime instanceof Timestamp ? f.dateTime.toDate() : null;

          return {
            id: f.id,
            mealType: f.mealType || "Unknown",
            description: f.mealDescription || "-",
            time: dateTime
              ? dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            status: f.status || "Pending",
            date: dateTime,
          };
        });

        // Separate upcoming (not completed yet) and completed
        const upcoming = parsed.filter(
          (f) => f.status.toLowerCase() !== "completed" && (!f.date || f.date >= now)
        );

        const completed = parsed.filter(
          (f) => f.status.toLowerCase() === "completed" || (f.date && f.date < now)
        );

        setUpcomingFoods(upcoming);
        setCompletedFoods(completed);
      } catch (err) {
        console.error("Error fetching daily foods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [user]);

  if (loading) return <p className="loading">Loading daily food log...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Daily Food Log</h1>

        {/* ─── Upcoming / Not Completed ───────────────────────── */}
        <div className="table-section">
          <h2 className="section-title">Upcoming / Not Completed</h2>
          {upcomingFoods.length === 0 ? (
            <p className="empty-message">No upcoming meals.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Meal Type</th>
                  <th>Description</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingFoods.map((f) => (
                  <tr key={f.id}>
                    <td>{f.mealType}</td>
                    <td>{f.description}</td>
                    <td>{f.time}</td>
                    <td>
                      <span className="status pending">{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ─── Completed ───────────────────────── */}
        <div className="table-section">
          <h2 className="section-title">Completed Meals</h2>
          {completedFoods.length === 0 ? (
            <p className="empty-message">No completed meals yet.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Meal Type</th>
                  <th>Description</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedFoods.map((f) => (
                  <tr key={f.id}>
                    <td>{f.mealType}</td>
                    <td>{f.description}</td>
                    <td>{f.time}</td>
                    <td>
                      <span className="status taken">{f.status}</span>
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