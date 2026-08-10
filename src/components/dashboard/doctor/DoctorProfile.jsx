import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, updateDoc, query, where, getDocs } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../components/AuthContext";
import "./DoctorProfile.css";

export default function DoctorProfile() {
  const { profile, loading: authLoading } = useAuth();
  const [doctorData, setDoctorData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (!profile) return;

    const fetchDoctorProfile = async () => {
      try {
        const userRef = doc(db, "users", profile.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());

        const doctorQuery = query(collection(db, "doctors"), where("uid", "==", userRef));
        const snapshot = await getDocs(doctorQuery);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setDoctorData(data);
          setEditData({ ...userSnap.data(), ...data });
        } else {
          console.warn("No doctor profile found");
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [profile]);

  const handleEdit = () => { setIsEditing(true); setError(""); };
  const handleCancel = () => { setEditData({ ...userData, ...doctorData }); setIsEditing(false); setError(""); };
  const handleChange = (field, value) => { setEditData(prev => ({ ...prev, [field]: value })); };

  const handleSave = async () => {
    setError("");
    if (!editData.firstName || !editData.lastName) return setError("Name is required");
    if (!editData.medicalField) return setError("Medical field is required");
    if (!editData.officeAddress) return setError("Office address is required");

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", profile.uid);

      // Update doctor document
      const doctorQuery = query(collection(db, "doctors"), where("uid", "==", userRef));
      const snapshot = await getDocs(doctorQuery);
      if (!snapshot.empty) {
        const doctorDocRef = snapshot.docs[0].ref;
        await updateDoc(doctorDocRef, {
          medicalField: editData.medicalField,
          placeOfEmployment: editData.placeOfEmployment,
          officeAddress: editData.officeAddress,
          officeRoomNo: editData.officeRoomNo,
          officeContactNo: editData.officeContactNo,
          yearsExperience: editData.yearsExperience,
        });
        setDoctorData({ ...editData });
      }

      // Update user document
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
    setPasswordSuccess("");

    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      return setPasswordError("All fields are required");
    }
    if (passwordData.new !== passwordData.confirm) {
      return setPasswordError("New passwords do not match");
    }
    if (passwordData.new.length < 6) {
      return setPasswordError("New password must be at least 6 characters");
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordData.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.new);
      setPasswordSuccess("Password updated successfully");
      setPasswordData({ current: "", new: "", confirm: "" });
      setChangingPassword(false);
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to change password. Check your current password.");
    }
  };

  if (authLoading || loading) return <p>Loading profile...</p>;
  if (!userData) return <p>No profile data found.</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Doctor Profile</h3>
          {!isEditing ? (
           <button className="dashboard-button-blue" onClick={handleEdit}>Edit Profile</button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="dashboard-button-blue" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
              <button className="dashboard-button-white" onClick={handleCancel} disabled={isSaving}>Cancel</button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        <hr />

        {/* User info */}
        <p><strong>First Name:</strong> {isEditing ? <input value={editData.firstName} onChange={e => handleChange("firstName", e.target.value)} /> : userData.firstName}</p>
        <p><strong>Last Name:</strong> {isEditing ? <input value={editData.lastName} onChange={e => handleChange("lastName", e.target.value)} /> : userData.lastName}</p>
        <p><strong>Email:</strong> {isEditing ? <input value={editData.email} onChange={e => handleChange("email", e.target.value)} /> : userData.email}</p>
        <p><strong>Contact Number:</strong> {isEditing ? <input value={editData.contactNumber} onChange={e => handleChange("contactNumber", e.target.value)} /> : userData.contactNumber}</p>
        <p><strong>Address:</strong> {isEditing ? <input value={editData.address} onChange={e => handleChange("address", e.target.value)} /> : userData.address}</p>
        <p><strong>Birth Date:</strong> {isEditing ? <input type="date" value={editData.birthDate} onChange={e => handleChange("birthDate", e.target.value)} /> : userData.birthDate}</p>
        <p><strong>Gender:</strong> {isEditing ? (
          <select value={editData.gender} onChange={e => handleChange("gender", e.target.value)}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : userData.gender}</p>

        <p>
          <strong>Password:</strong> ********
          {!changingPassword && <span className="change-password" onClick={() => setChangingPassword(true)}>Change Password</span>}
        </p>

        {changingPassword && (
          <div style={{ marginTop: "0.5rem" }}>
            <input type="password" placeholder="Current password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} />
            <input type="password" placeholder="New password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} />
            <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} />
            <button onClick={handlePasswordChange}>Save Password</button>
            <button onClick={() => { setChangingPassword(false); setPasswordData({current:"", new:"", confirm:""}); }}>Cancel</button>
            {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ color: "green" }}>{passwordSuccess}</p>}
          </div>
        )}

        <hr />

        {/* Doctor-specific info */}
        {doctorData ? (
          <>
            <p><strong>Field of Specialization:</strong> {isEditing ? <input value={editData.medicalField} onChange={e => handleChange("medicalField", e.target.value)} /> : doctorData.medicalField}</p>
            <p><strong>Hospital / Office:</strong> {isEditing ? <input value={editData.placeOfEmployment} onChange={e => handleChange("placeOfEmployment", e.target.value)} /> : doctorData.placeOfEmployment}</p>
            <p><strong>Office Address:</strong> {isEditing ? <input value={editData.officeAddress} onChange={e => handleChange("officeAddress", e.target.value)} /> : doctorData.officeAddress}</p>
            <p><strong>Office Room:</strong> {isEditing ? <input value={editData.officeRoomNo} onChange={e => handleChange("officeRoomNo", e.target.value)} /> : doctorData.officeRoomNo}</p>
            <p><strong>Office Contact:</strong> {isEditing ? <input value={editData.officeContactNo} onChange={e => handleChange("officeContactNo", e.target.value)} /> : doctorData.officeContactNo}</p>
            <p><strong>Years Experience:</strong> {isEditing ? <input type="number" value={editData.yearsExperience} onChange={e => handleChange("yearsExperience", e.target.value)} /> : doctorData.yearsExperience}</p>
          </>
        ) : (
          <p>No doctor profile found.</p>
        )}
      </div>
    </div>
  );
}
