import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";      // <-- your Header.jsx
import Footer from "../components/common/Footer";      // <-- your Footer.jsx
import Sidebar from "../components/admin/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-main">
        <Sidebar />
        <main className="admin-content" role="main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
