import React from "react";
import { NavLink } from "react-router-dom";
import "../../layouts/AdminLayout.css";

export default function Sidebar() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="sidebar-header">Admin Panel</div>
      <nav>
        <ul className="sidebar-menu">
          <li><NavLink to="/admin" end className={linkClass}>Dashboard</NavLink></li>
          <li><NavLink to="/admin/employees" className={linkClass}>Employee Management</NavLink></li>
          <li><NavLink to="/admin/content" className={linkClass}>Education Content Management</NavLink></li>
          <li><NavLink to="/admin/quizzes" className={linkClass}>Quiz Management</NavLink></li>
          <li><NavLink to="/admin/phishing-simulation" className={linkClass}>Phishing Simulation</NavLink></li>
          <li><NavLink to="/admin/profile" className={linkClass}>Profile (Edit)</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}