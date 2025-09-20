// Author: Aazaf Ritha
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../../api/quizzes";
import "./QuizManage.css";

export default function QuizManage() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      setItems(await quizApi.list({ status, q }));
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
  }, [status, q]);

  const publish = async (id) => {
    if (!confirm("Publish this quiz to ALL employees?")) return;
    setBusyId(id);
    try {
      await quizApi.publish(id);
      await load();
      alert("Published. Employees can see it on their dashboard.");
    } catch (e) {
      alert(e.message || "Publish failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    setBusyId(id);
    try {
      await quizApi.remove(id);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const edit = (id) => nav(`/admin/quizzes/${id}/edit`);

  const duplicate = async (id) => {
    if (!confirm("Duplicate this quiz as a new draft version?")) return;
    setBusyId(id);
    try {
      const copy = await quizApi.duplicate(id);
      nav(`/admin/quizzes/${copy._id || copy.id}/edit`);
    } catch (e) {
      alert(e.message || "Duplicate failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="quiz-manage-page">
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
          <h1 className="content-main-title">Quiz Management</h1>
          <p className="content-subtitle">Manage and organize quiz content for employee training.</p>
        </div>
        <div className="content-header-actions">
          <button
            className="new-quiz-btn"
            onClick={() => nav("/admin/quizzes/create")}
          >
            + New Quiz
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
          {/* Filters */}
          <div className="content-section">
            <div className="filters-container">
              <div className="search-box">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title…"
                  className="search-input"
                />
              </div>
              <div className="filter-box">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <button className="refresh-btn" onClick={load}>
                Refresh
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <div className="loading-message">Loading quizzes…</div>}
          {err && <div className="error-message">{err}</div>}
          {!loading && !err && filtered.length === 0 && (
            <div className="empty-state">
              No quizzes found.
            </div>
          )}

          {/* Quiz Grid */}
          {!loading && !err && (
            <div className="quiz-grid">
              {filtered.map(qz => (
                <div key={qz._id || qz.id} className="quiz-card">
                  {/* Banner */}
                  {qz.bannerImage && (
                    <div className="quiz-banner-container">
                      <img
                        src={qz.bannerImage}
                        alt=""
                        className="quiz-banner-image"
                      />
                      <div className="quiz-banner-overlay"></div>
                    </div>
                  )}

                  <div className="quiz-card-content">
                    <div className="quiz-header">
                      <div className="quiz-title">{qz.title}</div>
                      <div className="quiz-date">
                        {qz.createdAt ? new Date(qz.createdAt).toLocaleString() : ""}
                      </div>
                    </div>

                    <div className="quiz-badges">
                      <span className={`status-badge ${qz.status}`}>{qz.status}</span>
                      <span className="version-badge">v{qz.version}</span>
                      {qz.timeLimitSec ? (
                        <span className="time-badge">{qz.timeLimitSec}s</span>
                      ) : (
                        <span className="time-badge">no time limit</span>
                      )}
                      {qz.dueAt && (
                        <span className="due-badge">
                          due {new Date(qz.dueAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="quiz-description">{qz.description || "No description."}</p>
                    <div className="quiz-meta">{(qz.questions || []).length} question(s)</div>

                    <div className="quiz-actions">
                      <button
                        className="action-btn preview-btn"
                        onClick={() => setPreview(qz)}
                      >
                        Preview
                      </button>

                      {qz.status === "draft" ? (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => edit(qz._id || qz.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn publish-btn"
                            disabled={busyId === (qz._id || qz.id)}
                            onClick={() => publish(qz._id || qz.id)}
                          >
                            {busyId === (qz._id || qz.id) ? "Publishing…" : "Publish"}
                          </button>
                        </>
                      ) : (
                        <button
                          className="action-btn duplicate-btn"
                          disabled={busyId === (qz._id || qz.id)}
                          onClick={() => duplicate(qz._id || qz.id)}
                        >
                          {busyId === (qz._id || qz.id) ? "Duplicating…" : "Duplicate"}
                        </button>
                      )}

                      <button
                        className="action-btn delete-btn"
                        disabled={busyId === (qz._id || qz.id)}
                        onClick={() => remove(qz._id || qz.id)}
                      >
                        {busyId === (qz._id || qz.id) ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-content quiz-preview-modal" onClick={(e) => e.stopPropagation()}>
            {/* Banner in preview */}
            {preview.bannerImage && (
              <img
                src={preview.bannerImage}
                alt=""
                className="preview-banner"
              />
            )}

            <div className="modal-header">
              <div>
                <h3 className="modal-title">Preview: {preview.title}</h3>
                <p className="modal-subtitle">
                  Time limit: {preview.timeLimitSec ? `${preview.timeLimitSec}s` : "none"} · Pass: {preview.passMark}%
                </p>
              </div>
              <button className="close-btn" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              {(preview.questions || []).map((q, idx) => (
                <div key={q._id || idx} className="preview-question">
                  <div className="question-number">Question {idx + 1}</div>
                  <div className="question-text">{q.stem}</div>
                  <ul className="options-list">
                    {(q.options || []).map((o, i) => (
                      <li key={o._id || i} className="option-item">
                        • {o.text}{" "}
                        {o.isCorrect ? (
                          <span className="correct-badge">correct</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setPreview(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
