// Landing.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const location = useLocation();
  const [status, setStatus] = useState("Processing your request...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("tk");

    if (!token) {
      setStatus("Invalid or missing token.");
      return;
    }

    // Record click in backend
    axios
      .post("http://localhost:5000/api/simulations/record", {
        token,
        eventType: "link_clicked"
      })
      .then(() => {
        setStatus("Oops! You clicked it 😅\nLooks like you just gave a hacker a high-five! 🖐️ But don't worry, no real harm done—this was a safe simulation.\nRemember: if it looks suspicious, think twice before clicking! A real hacker won't say 'just kidding.' 😉");
      })
      .catch((err) => {
        console.error(err);
        setStatus("There was an error processing your request.");
      });
  }, [location]);

  return (
    <div style={{ padding: "20px", textAlign: "center", whiteSpace: "pre-line" }}>
      <h2>Simulation Alert!</h2>
      <p>{status}</p>
    </div>
  );
};

export default Landing;
