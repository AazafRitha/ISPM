import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Employee from "../models/Employee.js";
import SimulationEvent from "../models/SimulationEvent.js";

// Load environment variables
dotenv.config();

const router = express.Router();

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((err, success) => {
  if (err) console.error("Transporter error:", err);
  else console.log("Transporter ready:", success);
});

// ------------------- START SIMULATION -------------------
router.post("/start", async (req, res) => {
  const { simulationName, subject, htmlTemplate, selectedEmployees } = req.body;

  // Check environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ msg: "Email credentials are missing in .env" });
  }

  try {
    // Determine which employees to send to
    let employees;
    if (Array.isArray(selectedEmployees) && selectedEmployees.length > 0) {
      employees = await Employee.find({ email: { $in: selectedEmployees } });
    } else {
      employees = await Employee.find();
    }

    if (!employees.length) {
      return res.status(400).json({ msg: "No employees found to send simulation." });
    }

    // Send email to each employee
    for (let emp of employees) {
      try {
        const token = Buffer.from(`${simulationName}|${emp.email}`).toString("base64");
        const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";
        const trackingLink = `${FRONTEND_URL}/landing?tk=${token}`;
        const html = htmlTemplate.replace("{{TRACKING_LINK}}", trackingLink);

        await transporter.sendMail({
          from: `"IT Security" <${process.env.EMAIL_USER}>`,
          to: emp.email,
          subject,
          html,
        });

        await SimulationEvent.create({
          simulationName,
          email: emp.email,
          eventType: "email_sent",
        });

        console.log(`Email sent to ${emp.email}`);
      } catch (mailErr) {
        console.error(`Failed to send email to ${emp.email}:`, mailErr.message);
      }
    }

    res.json({ msg: "Simulation emails processed successfully." });
  } catch (err) {
    console.error("Simulation start error:", err);
    res.status(500).json({ success: false, message: "Simulation failed", error: err.message });
  }
});




// ------------------- MARK SIMULATION LAUNCHED -------------------
router.post("/mark-launched", async (req, res) => {
  const { templateName } = req.body;

  try {
    await SimulationEvent.create({
      simulationName: templateName,
      email: "SYSTEM",
      eventType: "simulation_launched",
    });

    res.json({ msg: "Simulation marked as launched" });
  } catch (err) {
    console.error("Mark launched error:", err);
    res.status(500).json({ msg: "Failed to mark launched", error: err.message });
  }
});

// ------------------- GET SIMULATION STATS -------------------
router.get("/:simulationName/stats", async (req, res) => {
  try {
    const { simulationName } = req.params;

    const employees = await Employee.find();
    const events = await SimulationEvent.find({ simulationName });

    const stats = employees.map((emp) => {
      const empEvents = events.filter((e) => e.email === emp.email);
      return {
        name: emp.name,
        email: emp.email,
        sent: empEvents.some((e) => e.eventType === "email_sent"),
        clicked: empEvents.some((e) => e.eventType === "link_clicked"),
        formSubmitted: empEvents.some((e) => e.eventType === "form_submitted"),
        sentAt: empEvents.find((e) => e.eventType === "email_sent")?.timestamp,
        clickedAt: empEvents.find((e) => e.eventType === "link_clicked")?.timestamp,
      };
    });

    res.json({ simulationName, stats });
  } catch (err) {
    console.error("Fetch stats error:", err);
    res.status(500).json({ msg: "Error fetching stats", error: err.message });
  }
});

export default router;
