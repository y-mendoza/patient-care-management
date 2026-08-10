import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./start.css";

export default function Home() {
  return (
    <div className="bg-animation">
      <div
        className="page-section"
        style={{ backgroundImage: "url('../Home.png')" }}
      >
        <div className="page-container">
          <h1 className="page-title">Accessible Online Health</h1>
          <p className="page-text">
            We’re dedicated to connecting patients to qualified doctors in a way that is safe, efficient, and effective.
          </p>
          <p className="page-text">
            We allow you to remotely connect with our partnered doctors, ensuring you stay fit and healthy even in the comfort of your own home.
          </p>
        </div>
      </div>
    </div>
  );
}