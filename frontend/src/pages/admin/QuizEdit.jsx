// Author: Aazaf Ritha
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizApi } from "../../api/quizzes";
import QuestionCard from "../../components/QuestionCard";
import "./QuizEdit.css";

function PreviewModal({ quiz, onClose }) {
  if (!quiz) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Preview: {quiz.title}</h3>
            <p className="modal-subtitle">
              Time limit: {quiz.timeLimitSec ? `${quiz.timeLimitSec}s` : "none"} · Pass: {quiz.passMark}%
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
          {(quiz.questions || []).map((q, idx) => (
            <div key={q.id || q._id || idx} className="preview-question">
              <div className="question-number">Question {idx + 1}</div>
              <div className="question-text">{q.stem}</div>
              <ul className="options-list">
                {(q.options || []).map((o, i) => (
                  <li key={o.id || o._id || i} className="option-item">
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
          <button className="btn btn-primary" onClick={onClose}>
            Looks good
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passMark, setPassMark] = useState(60);
  const [timeLimitSec, setTimeLimitSec] = useState(0);
  const [dueAt, setDueAt] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [previewOf, setPreviewOf] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const qz = await quizApi.getOne(id);
        setTitle(qz.title || "");
        setDescription(qz.description || "");
        setPassMark(qz.passMark ?? 60);
        setTimeLimitSec(qz.timeLimitSec ?? 0);
        setDueAt(qz.dueAt ? new Date(qz.dueAt).toISOString().slice(0, 16) : "");
        setQuestions((qz.questions || []).map(q => ({
          id: q.id || q._id || Math.random().toString(36).slice(2, 10),
          type: q.type || "mcq",
          stem: q.stem || "",
          explanation: q.explanation || "",
          options: (q.options || []).map(o => ({
            id: o.id || o._id || Math.random().toString(36).slice(2, 10),
            text: o.text || "",
            isCorrect: !!o.isCorrect,
          }))
        })));
        setStatus(qz.status || "draft");
        setErr("");
      } catch (e) {
        setErr(e.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateQuestion = (qid, next) =>
    setQuestions(prev => prev.map(q => q.id === qid ? next : q));
  const removeQuestion = (qid) =>
    setQuestions(prev => prev.filter(q => q.id !== qid));

  const draft = useMemo(() => ({
    title, 
    description, 
    passMark: Number(passMark) || 0,
    timeLimitSec: Number(timeLimitSec) || null,
    status, // server will still block non-draft updates; we keep value here
    assignedTo: { roles: [], users: [], departments: [] },
    dueAt: dueAt || null,
    questions
  }), [title, description, passMark, timeLimitSec, dueAt, status, questions]);

  const canSave =
    status === "draft" &&
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => {
      if (!q.stem?.trim()) return false;
      if (q.type === "single") return ((q.options?.[0]?.text || "").trim().length > 0);
      if (q.type === "tf") return (q.options?.length === 2) && q.options.some(o => o.isCorrect);
      return (q.options?.length > 0) && q.options.some(o => o.isCorrect);
    });

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await quizApi.update(id, draft);
      nav("/admin/quizzes");
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="quiz-edit-page">
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

      {/* Content Creation Header */}
      <div className="content-header">
        <div className="content-header-left">
          <button className="back-btn" onClick={() => nav("/admin/quizzes")}>
            ← Back
          </button>
        </div>
        <div className="content-header-center">
          <h1 className="content-main-title">Edit Quiz</h1>
          <p className="content-subtitle">Modify quiz content and settings.</p>
        </div>
        <div className="content-header-actions">
          <button 
            className="preview-btn"
            onClick={() => setPreviewOf(draft)}
            disabled={!canSave}
          >
            <span className="btn-icon">👁️</span>
            Preview
          </button>
          <button 
            className="save-draft-btn"
            onClick={save}
            disabled={!canSave || saving}
          >
            <span className="btn-icon">📄</span>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
          {loading && <div className="loading-message">Loading…</div>}
          {err && <div className="error-message">{err}</div>}

          {!loading && !err && status !== "draft" && (
            <div className="status-warning">
              This quiz is <strong>not a draft</strong> and cannot be edited. Go back and click <em>Duplicate</em> to create a draft copy.
            </div>
          )}

          {!loading && !err && (
            <>
              {/* Quiz Details */}
              <div className="content-section">
                <h2 className="section-title">Quiz Details</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Title *</label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="form-input"
                      placeholder="Enter quiz title..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Pass mark (%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={passMark} 
                      onChange={(e) => setPassMark(e.target.value)} 
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Time limit (seconds)</label>
                    <input 
                      type="number" 
                      min={0} 
                      value={timeLimitSec} 
                      onChange={(e) => setTimeLimitSec(e.target.value)} 
                      className="form-input"
                    />
                    <div className="form-hint">0 = no time limit</div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Due date</label>
                    <input 
                      type="datetime-local" 
                      value={dueAt} 
                      onChange={(e) => setDueAt(e.target.value)} 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    rows={3} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="form-textarea"
                    placeholder="Brief description of the quiz..."
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="content-section">
                <h2 className="section-title">Questions</h2>

                <div className="questions-list">
                  {questions.map((q) => (
                    <QuestionCard 
                      key={q.id}
                      q={q}
                      onChange={(next) => updateQuestion(q.id, next)}
                      onRemove={() => removeQuestion(q.id)}
                    />
                  ))}
                  {questions.length === 0 && (
                    <div className="empty-questions">
                      No questions found.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PreviewModal quiz={previewOf} onClose={() => setPreviewOf(null)} />
    </div>
  );
}
