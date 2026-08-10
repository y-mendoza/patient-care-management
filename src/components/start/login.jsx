import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./start.css";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = userSnap.data();

        if (!profile.token) {
          const newToken = uuidv4();
          await updateDoc(userRef, { token: newToken });
          profile.token = newToken;
        }

        localStorage.setItem("userProfile", JSON.stringify(profile));
        localStorage.setItem("authToken", profile.token);

        switch (profile.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "doctor":
            navigate("/doctor/dashboard");
            break;
          case "patient":
            navigate("/patient/dashboard");
            break;
          default:
            alert("No valid role found. Please contact support.");
            navigate("/login");
        }
      }
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="bg-animation">
    <div className="login-page">
      <div className="login-overlay"></div>
      <div className="login-content animate__animated">
        <div className="login-box">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="email" className="form-label fw-semibold">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Enter email"
                required
              />
            </div>

            <div className="mb-3 text-start">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                required
              />
            </div>

            {error && <p className="text-danger text-center">{error}</p>}

            <div className="d-flex justify-content-center mt-4">
              <button type="submit" className="btn btn-primary w-50">
                Login
              </button>
            </div>

            <div className="text-center mt-3">
              <a href="#" className="text-decoration-none">
                Forgot password? Contact an administrator.
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}