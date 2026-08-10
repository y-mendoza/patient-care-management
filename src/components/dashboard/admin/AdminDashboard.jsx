import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ name: "", role: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    };
    fetchData();
  }, []);

  // Add new user
  const handleAdd = async () => {
    if (!newRecord.name.trim() || !newRecord.role.trim()) return;
    await addDoc(collection(db, "users"), newRecord);
    setNewRecord({ name: "", role: "" });
    window.location.reload();
  };

  // Update user
  const handleUpdate = async (id, updatedData) => {
    const ref = doc(db, "users", id);
    await updateDoc(ref, updatedData);
    setEditingId(null);
    window.location.reload();
  };

  // Delete user
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", id));
    window.location.reload();
  };

  return (
    <div className="management-container">
      <h2 className="management-title">Admin Dashboard</h2>

      {/* Add User Section */}
      <div className="management-form align-left compact">
        <h3>Add New User</h3>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter name"
            value={newRecord.name}
            onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Enter role"
            value={newRecord.role}
            onChange={(e) => setNewRecord({ ...newRecord, role: e.target.value })}
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-wrapper management-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  {editingId === record.id ? (
                    <input
                      type="text"
                      defaultValue={record.name}
                      onBlur={(e) =>
                        handleUpdate(record.id, {
                          ...record,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    record.name
                  )}
                </td>
                <td>
                  {editingId === record.id ? (
                    <input
                      type="text"
                      defaultValue={record.role}
                      onBlur={(e) =>
                        handleUpdate(record.id, {
                          ...record,
                          role: e.target.value,
                        })
                      }
                    />
                  ) : (
                    record.role
                  )}
                </td>
                <td className="actions-cell">
                  {editingId === record.id ? (
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <div className="action-row">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => setEditingId(record.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(record.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
