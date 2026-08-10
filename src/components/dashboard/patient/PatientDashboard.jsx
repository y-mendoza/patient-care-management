import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../AuthContext";
import "./PatientDashboard.css";

function parseDate(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Timestamp) return dateValue.toDate();
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyMeds, setDailyMeds] = useState([]);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [intakeLogs, setIntakeLogs] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) setProfile(userSnap.data());

      const todayStr = new Date().toDateString();

      const medQuery = query(
        collection(db, "dailyIntakeMonitor"),
        where("patient", "==", userDocRef)
      );
      const medSnap = await getDocs(medQuery);
      const meds = medSnap.docs.map((d) => ({
        ...d.data(),
        docId: d.id,
        dateTime: parseDate(d.data().dateTime),
      }));

      const mealQuery = query(
        collection(db, "dailyMealsChecklist"),
        where("patient", "==", userDocRef)
      );
      const mealSnap = await getDocs(mealQuery);
      const meals = mealSnap.docs.map((d) => ({
        ...d.data(),
        docId: d.id,
        dateTime: parseDate(d.data().dateTime),
      }));

      const logs = {};
      meds.forEach((m) => {
        const dateStr = m.dateTime?.toDateString();
        if (!dateStr) return;
        logs[dateStr] = {
          ...logs[dateStr],
          medStatus: m.status?.toLowerCase(),
          medDocId: m.docId,
        };
      });
      meals.forEach((m) => {
        const dateStr = m.dateTime?.toDateString();
        if (!dateStr) return;
        logs[dateStr] = {
          ...logs[dateStr],
          mealStatus: m.status?.toLowerCase(),
          mealDocId: m.docId,
        };
      });

      setIntakeLogs(logs);

      const todayMeds = meds.filter(
        (m) => m.dateTime?.toDateString() === todayStr
      );
      const todayMeals = meals.filter(
        (m) => m.dateTime?.toDateString() === todayStr
      );

      setDailyMeds(todayMeds);
      setDailyMeals(todayMeals);

      const notifs = [];
      todayMeds.forEach((m) => {
        if (m.status?.toLowerCase() !== "taken")
          notifs.push(`Missed medicine: ${m.medication}`);
      });
      todayMeals.forEach((m) => {
        if (m.status?.toLowerCase() !== "completed")
          notifs.push(`Missed meal: ${m.mealDescription}`);
      });
      setNotifications(notifs);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
      case "completed":
        return "green";
      case "incomplete":
        return "yellow";
      case "not taken":
      case "nottaken":
        return "red";
      default:
        return "gray";
    }
  };

  const getLogForDate = (date) => {
    const log = intakeLogs[date.toDateString()] || {};
    return {
      mealStatus: log.mealStatus || "notTaken",
      medStatus: log.medStatus || "notTaken",
      mealDocId: log.mealDocId || null,
      medDocId: log.medDocId || null,
    };
  };

  const updateStatus = async (date, type) => {
    try {
      const log = getLogForDate(date);
      const statusKey = type === "med" ? "medStatus" : "mealStatus";
      const docId = type === "med" ? log.medDocId : log.mealDocId;
      const newStatus =
        log[statusKey] === "taken" || log[statusKey] === "completed"
          ? "notTaken"
          : "taken";

      if (docId) {
        const collectionName =
          type === "med" ? "dailyIntakeMonitor" : "dailyMealsChecklist";
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, { status: newStatus });
        setIntakeLogs((prev) => ({
          ...prev,
          [date.toDateString()]: {
            ...prev[date.toDateString()],
            [statusKey]: newStatus,
          },
        }));
      } else {
        console.warn("No log document found for this day");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;

  const monday = getMonday(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="patient-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Good Morning, {profile?.firstName || "User"}!</h2>
          <p>You are on a {profile?.streak || 0}-day streak!</p>
        </div>

        <div className="dashboard-card">
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card">
          <h2>This Week's Intake</h2>
          <div className="week-scroll">
            <div className="week-grid">
              {weekDays.map((day) => {
                const log = getLogForDate(day);
                return (
                  <div key={day.toDateString()} className="day-box">
                    <strong>
                      {day.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </strong>
                    <div className="status-bar">
                      <span
                        className="status-meal"
                        style={{
                          backgroundColor: getStatusColor(log.mealStatus),
                          cursor: "pointer",
                        }}
                        onClick={() => updateStatus(day, "meal")}
                      >
                        Meal
                      </span>
                      <span
                        className="status-med"
                        style={{
                          backgroundColor: getStatusColor(log.medStatus),
                          cursor: "pointer",
                        }}
                        onClick={() => updateStatus(day, "med")}
                      >
                        Med
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="legend">
            <span>
              <span
                className="legend-box"
                style={{ backgroundColor: "green" }}
              ></span>{" "}
              Taken/Completed
            </span>
            <span>
              <span
                className="legend-box"
                style={{ backgroundColor: "yellow" }}
              ></span>{" "}
              Incomplete
            </span>
            <span>
              <span
                className="legend-box"
                style={{ backgroundColor: "red" }}
              ></span>{" "}
              Not Taken
            </span>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Today's Checklist</h2>
          <h3>Medicine</h3>
          {dailyMeds.length === 0 ? (
            <p>No medicines scheduled</p>
          ) : (
            <ul>
              {dailyMeds.map((m) => (
                <li key={m.docId} style={{ color: getStatusColor(m.status) }}>
                  {m.medication} - {m.dosage} ({m.status})
                </li>
              ))}
            </ul>
          )}

          <h3>Meals</h3>
          {dailyMeals.length === 0 ? (
            <p>No meals scheduled</p>
          ) : (
            <ul>
              {dailyMeals.map((m) => (
                <li key={m.docId} style={{ color: getStatusColor(m.status) }}>
                  {m.mealDescription} ({m.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
