import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminDashboard.css";
import { getAdminProfile } from "../../services/adminApi";
import { getAuth } from "../../lib/auth";

const initialState = {
  totalEmployees: 0,
  activeContent: 0,
  publishedQuizzes: 0,
  phishingCampaigns: 0,
  systemHealth: 0,
  recent: {
    employees: [],
    content: [],
  },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(initialState);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/metrics");
        if (!res.ok) throw new Error(`Failed to load metrics: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMetrics({ ...initialState, ...data });
          setLoading(false);
          setError(""); // Clear any previous errors
        }
      } catch (e) {
        console.error("Dashboard metrics error:", e);
        // Fallback demo data (safe if backend not ready)
        if (!cancelled) {
          setMetrics({
            totalEmployees: 0,
            activeContent: 0,
            publishedQuizzes: 0,
            phishingCampaigns: 0,
            systemHealth: 0,
            recent: {
              employees: [],
              content: [],
            },
          });
          setError(`Backend connection failed: ${e.message}. Showing empty state.`);
          setLoading(false);
        }
      }
    }
    load();

    // Load admin name for welcome note
    (async () => {
      try {
        const p = await getAdminProfile();
        if (!cancelled) setAdminName(p?.name || "");
      } catch {
        const auth = getAuth?.() || {};
        if (!cancelled) setAdminName(auth.name || "Admin");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="adm-wrap">
      <div className="adm-titlebar">
        <div>
          <h2 className="adm-h2">Admin Dashboard</h2>
          <p className="adm-sub">Overview of employees, content, quizzes, and simulations</p>
        </div>
        <div className="adm-actions">
          <button className="btn" onClick={() => navigate("/admin/employees")}>Add Employee</button>
          <button className="btn" onClick={() => navigate("/admin/content")}>New Content</button>
          <button className="btn" onClick={() => navigate("/admin/quizzes")}>Create Quiz</button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading dashboard…</div>
      ) : (
        <>
          {error ? <div className="alert">Using demo data: {error}</div> : null}

          {/* Welcome note */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Welcome{adminName ? `, ${adminName}` : ''} 👋</h3>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Here’s what’s happening across employees, content, quizzes, and simulations today.</p>
          </div>

          {/* KPI cards */}
          <div className="kpi-grid">
            <KPI title="Employees" value={metrics.totalEmployees} to="/admin/employees" />
            <KPI title="Active Content" value={metrics.activeContent} to="/admin/content" />
            <KPI title="Published Quizzes" value={metrics.publishedQuizzes} to="/admin/quizzes" />
            <KPI title="Phishing Campaigns" value={metrics.phishingCampaigns} to="/admin/phishing-simulation" />
          </div>

          {/* System health + quick links */}
          <div className="two-col">
            <div className="card">
              <h3 className="card-title">System Health</h3>
              <HealthMeter percent={metrics.systemHealth} />
              <ul className="meta">
                <li>API: <strong>OK</strong></li>
                <li>DB: <strong>OK</strong></li>
                <li>Latency: <strong>Low</strong></li>
              </ul>
            </div>

            <div className="card">
              <h3 className="card-title">Quick Links</h3>
              <div className="quick-links">
                <Link className="ql" to="/admin/employees">Manage Employees</Link>
                <Link className="ql" to="/admin/content">Manage Content</Link>
                <Link className="ql" to="/admin/quizzes">Manage Quizzes</Link>
                <Link className="ql" to="/admin/phishing-simulation">Phishing Simulation</Link>
                <Link className="ql" to="/admin/policies">Policy Management</Link>
                <Link className="ql" to="/admin/profile">
                Edit Profile</Link>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="two-col">
            <div className="card">
              <h3 className="card-title">Recent Employees</h3>
              {metrics.recent.employees.length > 0 ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Name</th><th>Department</th><th>When</th></tr>
                  </thead>
                  <tbody>
                    {metrics.recent.employees.map((e, i) => (
                      <tr key={i}><td>{e.name}</td><td>{e.dept}</td><td>{e.when}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No employees found. <Link to="/admin/employees">Add your first employee</Link></p>
              )}
            </div>

            <div className="card">
              <h3 className="card-title">Recent Content</h3>
              {metrics.recent.content.length > 0 ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Title</th><th>Published</th></tr>
                  </thead>
                  <tbody>
                    {metrics.recent.content.map((c, i) => (
                      <tr key={i}><td>{c.title}</td><td>{c.when}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No published content found. <Link to="/admin/content">Create your first content</Link></p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */

function KPI({ title, value, to }) {
  return (
    <Link className="kpi card" to={to}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-more">View →</div>
    </Link>
  );
}

function HealthMeter({ percent = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="meter">
      <div className="bar" style={{ width: `${clamped}%` }} />
      <div className="meter-label">{clamped}% healthy</div>
    </div>
  );
}
