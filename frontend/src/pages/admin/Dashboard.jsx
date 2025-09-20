import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminDashboard.css";

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
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (!res.ok) throw new Error("Failed to load metrics");
        const data = await res.json();
        if (!cancelled) {
          setMetrics({ ...initialState, ...data });
          setLoading(false);
        }
      } catch (e) {
        // Fallback demo data (safe if backend not ready)
        if (!cancelled) {
          setMetrics({
            totalEmployees: 42,
            activeContent: 18,
            publishedQuizzes: 7,
            phishingCampaigns: 3,
            systemHealth: 98.5,
            recent: {
              employees: [
                { name: "A. Perera", dept: "IT", when: "2h ago" },
                { name: "H. Fernando", dept: "HR", when: "5h ago" },
                { name: "R. Silva", dept: "Finance", when: "1d ago" },
              ],
              content: [
                { title: "Password Hygiene 101", when: "Today" },
                { title: "Phishing Red Flags", when: "Yesterday" },
              ],
            },
          });
          setError(e.message);
          setLoading(false);
        }
      }
    }
    load();
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
                <Link className="ql" to="/admin/profile">Edit Profile</Link>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="two-col">
            <div className="card">
              <h3 className="card-title">Recent Employees</h3>
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
            </div>

            <div className="card">
              <h3 className="card-title">Recent Content</h3>
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
