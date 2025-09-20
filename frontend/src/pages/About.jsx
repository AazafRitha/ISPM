import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export default function About() {
  return (
    <>
      <Header />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>About Us</h1>
        <p>
          Guardians Awareness is a comprehensive security education platform designed to help 
          organizations and individuals stay informed about cybersecurity best practices.
        </p>
        <p>
          Our mission is to make security awareness accessible, engaging, and effective through 
          interactive quizzes, educational content, and practical simulations.
        </p>
        <h2>Our Features</h2>
        <ul>
          <li>Interactive Security Quizzes</li>
          <li>Educational Content Library</li>
          <li>Phishing Simulation Campaigns</li>
          <li>Compliance Management</li>
          <li>Progress Tracking</li>
        </ul>
      </div>
      <Footer />
    </>
  );
}
