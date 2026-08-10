import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../components/AuthContext";
import "./PatientProfile.css";

export default function PatientProfile() {
  const { profile, loading: authLoading } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchPatientProfile = async () => {
      try {
        const userRef = doc(db, "users", profile.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());

        const patientQuery = query(collection(db, "patients"), where("uid", "==", userRef));
        const snapshot = await getDocs(patientQuery);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setPatientData(data);
          setEditData({ ...userSnap.data(), ...data });
        } else {
          console.warn("No patient profile found");
        }
      } catch (err) {
        console.error("Error fetching patient profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setEditData({ ...userData, ...patientData });
    setIsEditing(false);
    setError("");
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);

    try {
      const userRef = doc(db, "users", profile.uid);

      const patientQuery = query(collection(db, "patients"), where("uid", "==", userRef));
      const snapshot = await getDocs(patientQuery);
      if (!snapshot.empty) {
        const patientDocRef = snapshot.docs[0].ref;
        await updateDoc(patientDocRef, {
          chronicIllness: editData.chronicIllness || [],
          allergies: editData.allergies || [],
          insuranceProvider: editData.insuranceProvider || "",
          seniorCitizenStatus: editData.seniorCitizenStatus || false,
          pwdStatus: editData.pwdStatus || false
        });
        setPatientData({ ...editData });
      }

      await updateDoc(userRef, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        contactNumber: editData.contactNumber,
        address: editData.address,
        birthDate: editData.birthDate,
        gender: editData.gender,
      });
      setUserData({ ...editData });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      // Reauthenticate user
      const user = auth.currentUser;
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully!");
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to update password. Check current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || loading) return <p>Loading profile...</p>;
  if (!userData) return <p>No profile data found.</p>;

  return (
    <div className="profile-container" style={{ textAlign: "left" }}>
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Patient Profile</h3>
          {!isEditing ? (
            <button className="dashboard-button-blue" onClick={handleEdit}>Edit Profile</button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="dashboard-button-blue" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
              <button className="dashboard-button-white"onClick={handleCancel} disabled={isSaving}>Cancel</button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        <hr />

        {/* User Info */}
        <p><strong>First Name:</strong> {isEditing ? <input value={editData.firstName} onChange={e => handleChange("firstName", e.target.value)} /> : userData.firstName}</p>
        <p><strong>Last Name:</strong> {isEditing ? <input value={editData.lastName} onChange={e => handleChange("lastName", e.target.value)} /> : userData.lastName}</p>
        <p><strong>Email:</strong> {isEditing ? <input value={editData.email} onChange={e => handleChange("email", e.target.value)} /> : userData.email}</p>
        <p><strong>Contact Number:</strong> {isEditing ? <input value={editData.contactNumber} onChange={e => handleChange("contactNumber", e.target.value)} /> : userData.contactNumber}</p>

        {/* Password change */}
        <p>
          <strong>Password:</strong> ********{" "}
          {!isChangingPassword ? (
            <span className="change-password" style={{ cursor: "pointer", color: "blue" }} onClick={() => setIsChangingPassword(true)}>(Change Password)</span>
          ) : null}
        </p>

        {isChangingPassword && (
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            {passwordError && <p className="error-message">{passwordError}</p>}
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <div style={{ marginTop: "5px" }}>
              <button onClick={handlePasswordChange} disabled={passwordLoading}>{passwordLoading ? "Updating..." : "Update Password"}</button>
              <button onClick={() => setIsChangingPassword(false)} disabled={passwordLoading}>Cancel</button>
            </div>
          </div>
        )}

        <p><strong>Birth Date:</strong> {isEditing ? <input type="date" value={editData.birthDate} onChange={e => handleChange("birthDate", e.target.value)} /> : userData.birthDate}</p>
        <p><strong>Gender:</strong> {isEditing ? <select value={editData.gender} onChange={e => handleChange("gender", e.target.value)}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select> : userData.gender}</p>

        <hr />

        {/* Patient-specific info */}
        {patientData ? (
          <>
            <p><strong>Chronic Illness:</strong> {isEditing ? <input value={(editData.chronicIllness || []).join(", ")} onChange={e => handleChange("chronicIllness", e.target.value.split(",").map(i => i.trim()))} /> : (patientData.chronicIllness || []).join(", ")}</p>
            <p><strong>Allergies:</strong> {isEditing ? <input value={(editData.allergies || []).join(", ")} onChange={e => handleChange("allergies", e.target.value.split(",").map(i => i.trim()))} /> : (patientData.allergies || []).join(", ")}</p>
            <p><strong>Insurance Provider:</strong> {isEditing ? <input value={editData.insuranceProvider || ""} onChange={e => handleChange("insuranceProvider", e.target.value)} /> : patientData.insuranceProvider}</p>
            <p><strong>Senior Citizen:</strong> {isEditing ? <select value={editData.seniorCitizenStatus ? "Yes" : "No"} onChange={e => handleChange("seniorCitizenStatus", e.target.value === "Yes")}><option value="No">No</option><option value="Yes">Yes</option></select> : patientData.seniorCitizenStatus ? "Yes" : "No"}</p>
            <p><strong>PWD:</strong> {isEditing ? <select value={editData.pwdStatus ? "Yes" : "No"} onChange={e => handleChange("pwdStatus", e.target.value === "Yes")}><option value="No">No</option><option value="Yes">Yes</option></select> : patientData.pwdStatus ? "Yes" : "No"}</p>
          </>
        ) : (
          <p>No patient profile found.</p>
        )}
      </div>
    </div>
  );
}
