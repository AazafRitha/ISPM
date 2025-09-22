// Author: Aazaf Ritha
import { useEffect, useMemo, useState } from "react";
import { contentApi } from "../../api/content";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminContentManage.css";

export default function ContentManagement() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      setItems(await contentApi.list({ status, q, type }));
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [status, q, type]);

  const publish = async (id) => {
    if (!confirm("Publish this item?")) return;
    setBusy(id);
    try {
      await contentApi.publish(id);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  const unpublish = async (id) => {
    if (!confirm("Unpublish this item?")) return;
    setBusy(id);
    try {
      await contentApi.unpublish(id);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item?")) return;
    setBusy(id);
    try {
      await contentApi.remove(id);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="content-management">
      {/* Top Header Bar */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Content Header */}
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-main-title">Educational Content Management</h1>
          <p className="content-subtitle">Manage and organize educational content for employee training.</p>
        </div>
        <div className="content-header-actions">
          <button
            className="new-content-btn"
            onClick={() => nav("/admin/content/create")}
          >
            + New Content
          </button>
        </div>
      </div>

      <div className="cm-toolbar">
        <h2 className="cm-title">Educational Content</h2>
        <div className="cm-controls">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="cm-input"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="cm-select"
          >
            <option value="">All types</option>
            <option value="youtube">YouTube</option>
            <option value="pdf">PDF</option>
            <option value="blog">Blog</option>
            <option value="writeup">Write-up</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="cm-select"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button className="btn btn-outline" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="cm-note cm-note-muted">Loading…</div>}
      {err && <div className="cm-note cm-note-error">{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div className="cm-empty">No items found.</div>
      )}

      <div className="cm-grid">
        {filtered.map((it) => (
          <div key={it._id || it.id} className="cm-card">
            <div className="cm-card-head">
              <div className="cm-card-meta">
                <div className="cm-card-title">{it.title}</div>
                <div className="cm-badges">
                  <span className="badge">{it.type}</span>
                  <span className="badge">{it.status}</span>
                  {it.publishedAt && (
                    <span className="badge">
                      since {new Date(it.publishedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="cm-desc">{it.description}</p>
              </div>
              <div className="cm-date">
                {new Date(it.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="cm-actions">
              <button
                className="btn btn-outline"
                onClick={() => nav(`/employee/learn/${it._id || it.id}`)}
              >
                View
              </button>
              <button
                className="btn btn-outline"
                onClick={() => nav(`/admin/content/${it._id || it.id}/edit`)}
              >
                Edit
              </button>
              {it.status === "published" ? (
                <button
                  className="btn btn-outline"
                  disabled={busy === (it._id || it.id)}
                  onClick={() => unpublish(it._id || it.id)}
                >
                  {busy === (it._id || it.id) ? "…" : "Unpublish"}
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  disabled={busy === (it._id || it.id)}
                  onClick={() => publish(it._id || it.id)}
                >
                  {busy === (it._id || it.id) ? "…" : "Publish"}
                </button>
              )}
              <button
                className="btn btn-danger"
                disabled={busy === (it._id || it.id)}
                onClick={() => remove(it._id || it.id)}
              >
                {busy === (it._id || it.id) ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}