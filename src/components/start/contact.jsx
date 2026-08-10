import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./start.css";

export default function Contact() {
  return (
    <div className="bg-animation">
      <div
        className="page-section"
        style={{ backgroundImage: "url('../Contact.jpg')" }}
      >
        <div className="page-container">
          <h2 className="page-title">Contact</h2>
          <p className="page-text">
            <strong>Are you interested as a patient?</strong>
            <br />Email us through: <strong>SalamatDoc@applications.com</strong>
            <br />
            Email us to get the application process started. We’ll guide you however much you need
            throughout the process.
          </p>
          <p className="page-text">
            <strong>Are you interested in becoming a SalamatDoc doctor?</strong>
            <br />Email us through: <strong>SalamatDoc@applications.com</strong>
            <br />
            Emailing us will begin the process. You will undergo an authentication and screening process for everyone’s safety,
            security, and health. We only accept qualified and certified doctors that will do their best to help patients.
          </p>
        </div>
      </div>
    </div>
  );
}