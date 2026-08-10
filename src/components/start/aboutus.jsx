import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./start.css";

export default function AboutUs() {
  return (
    <div className="bg-animation">
      <div
        className="page-section"
        style={{ backgroundImage: "url('../Home.png')"}}
      >
        <div className="page-container">
          <h2 className="page-title">About Us</h2>
          <p className="page-text">
            We’re dedicated to connecting patients to qualified doctors in a way that is safe, efficient, and effective.
            With a mix of technology and classic human ingenuity and expertise, we made SalamatDoc.
            This has allowed us to remotely connect you to our partnered doctors, ensuring you stay fit and healthy even in the comfort of your own home.
          </p>
          <p className="page-text">
            The SalamatDoc website only allows account creation through contacting us. This ensures that everyone on the platform is legitimate, trustworthy, and safe.
          </p>
          <p className="page-text">
            Better services, better care, better health. Salamat, Doc!
          </p>
        </div>
    </div>
    </div>
  );
}