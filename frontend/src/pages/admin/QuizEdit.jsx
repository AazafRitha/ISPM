// Author: Aazaf Ritha
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizApi } from "../../api/quizzes";
import QuestionCard from "../../components/QuestionCard";
import "./QuizEdit.css";
import { badgeAssetForDifficulty } from "../../lib/badges";

function PreviewModal({ quiz, onClose }) {
  if (!quiz) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Preview: {quiz.title}</h3>
            <p className="modal-subtitle">
              Time limit: {quiz.timeLimitMin ? `${quiz.timeLimitMin} min` : "none"} · Pass: {quiz.passMark}%
            </p>
            {/* Banner and badge removed */}
          </div>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          {/* Banner and badge images removed */}
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
  // Banner removed
  const [difficulty, setDifficulty] = useState("medium");
  const [passMark, setPassMark] = useState(60);
  const [timeLimitMin, setTimeLimitMin] = useState(0);
  const [dueAt, setDueAt] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [previewOf, setPreviewOf] = useState(null);

  // Helpers to convert between backend and UI question formats
  const toUiType = (backendType) => {
    switch (backendType) {
      case "multiple-choice":
        return "mcq";
      case "true-false":
        return "tf";
      case "text":
        return "short";
      default:
        return "mcq";
    }
  };

  const fromBackendQuestion = (q) => {
    const id = q.id || q._id || Math.random().toString(36).slice(2, 10);
    const type = toUiType(q.type);
    const opts = Array.isArray(q.options) ? q.options : [];
    let options = [];
    if (type === "mcq") {
      options = opts.map((text, idx) => ({
        id: Math.random().toString(36).slice(2, 10),
        text: text || "",
        isCorrect: String(idx) === String(q.correctAnswer)
      }));
    } else if (type === "tf") {
      options = opts.map((text) => ({
        id: Math.random().toString(36).slice(2, 10),
        text: text || "",
        isCorrect: (text || "").toLowerCase() === String(q.correctAnswer || "").toLowerCase()
      }));
      // Ensure we have two options True/False if missing
      if (options.length === 0) {
        options = [
          { id: Math.random().toString(36).slice(2, 10), text: "True", isCorrect: String(q.correctAnswer) === "True" },
          { id: Math.random().toString(36).slice(2, 10), text: "False", isCorrect: String(q.correctAnswer) === "False" }
        ];
      }
    } else {
      options = [];
    }
    return {
      id,
      type,
      stem: q.question || "",
      explanation: q.explanation || "",
      options,
      points: q.points || 1
    };
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const qz = await quizApi.getOne(id);
        setTitle(qz.title || "");
        setDescription(qz.description || "");
        setDifficulty(qz.difficulty || "medium");
  // banner/badge removed
        setPassMark(qz.passingScore ?? 60);
  // Backend stores minutes; UI also uses minutes
  setTimeLimitMin(typeof qz.timeLimit === 'number' ? qz.timeLimit : 0);
        setDueAt(qz.dueAt ? new Date(qz.dueAt).toISOString().slice(0, 16) : "");
        setQuestions((qz.questions || []).map(fromBackendQuestion));
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

  const isBlobUrl = (u) => typeof u === 'string' && u.startsWith('blob:');

  const draft = useMemo(() => ({
    title, 
    description, 
    difficulty,
  // banner removed
    passMark: Number(passMark) || 0,
  timeLimitMin: Number(timeLimitMin) || null,
    status, // server will still block non-draft updates; we keep value here
    assignedTo: { roles: [], users: [], departments: [] },
    dueAt: dueAt || null,
    questions
  }), [title, description, difficulty, passMark, timeLimitSec, dueAt, status, questions]);

  const canSave =
    status === "draft" &&
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => {
      if (!q.stem?.trim()) return false;
      if (q.type === "short") return true;
      if (q.type === "tf") return (q.options?.length === 2) && q.options.some(o => o.isCorrect);
      // mcq
      return (q.options?.length >= 2) && q.options.some(o => o.isCorrect);
    });

  // Transform UI draft into backend payload (aligns with QuizCreate transform)
  const transformQuizForBackend = (quiz) => {
    return {
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
  timeLimit: typeof quiz.timeLimitMin === 'number' ? Math.max(0, Number(quiz.timeLimitMin)) : 0,
      passingScore: Number(quiz.passMark) || 0,
  // banner and badge omitted
      status: quiz.status,
      questions: (quiz.questions || []).map(q => {
        const normalizedType = q.type;
        const backendQuestion = {
          question: q.stem,
          type: normalizedType === "mcq" ? "multiple-choice" : normalizedType === "tf" ? "true-false" : "text",
          explanation: q.explanation || "",
          points: q.points || 1
        };
        if (normalizedType === "mcq") {
          const opts = (q.options || []).map(opt => ({ ...opt }));
          const firstCorrect = opts.findIndex(o => o.isCorrect);
          backendQuestion.options = opts.map(opt => opt.text);
          const correctIndex = firstCorrect >= 0 ? firstCorrect : 0;
          backendQuestion.correctAnswer = String(correctIndex);
        } else if (normalizedType === "tf") {
          const opts = (q.options || []).map(opt => ({ ...opt }));
          backendQuestion.options = opts.map(opt => opt.text);
          const correctOption = opts.find(opt => opt.isCorrect);
          backendQuestion.correctAnswer = correctOption ? correctOption.text : "True";
        } else {
          backendQuestion.options = [];
          backendQuestion.correctAnswer = ""; // text type allows empty
        }
        return backendQuestion;
      })
    };
  };

  // banner and badge upload handlers removed

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const backendPayload = transformQuizForBackend(draft);
      await quizApi.update(id, backendPayload);
      nav("/admin/quizzes");
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Math.random().toString(36).slice(2, 10),
      type: type,
      stem: "",
      explanation: "",
      options: type === "tf" ? [
        { id: Math.random().toString(36).slice(2, 10), text: "True", isCorrect: false },
        { id: Math.random().toString(36).slice(2, 10), text: "False", isCorrect: false }
      ] : [],
      points: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
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
              {/* Difficulty-based Banner Preview */}
              <div className={`banner-preview-strip diff-${difficulty}`}>
                <div className="banner-preview-title">{title || "Your Quiz Title"}</div>
              </div>
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
                    <label className="form-label">Time limit (minutes)</label>
                    <input 
                      type="number" 
                      min={0} 
                      value={timeLimitMin} 
                      onChange={(e) => setTimeLimitMin(e.target.value)} 
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
                  <div className="form-group">
                    <label className="form-label required">Difficulty *</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="form-select"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
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

                {/* Banner removed */}

                {/* Badge Preview based on difficulty */}
                <div className="badge-preview-row">
                  {(() => {
                    const asset = badgeAssetForDifficulty(difficulty);
                    return (
                      <div className="badge-preview-box">
                        <img src={asset.image} alt={asset.title} className="badge-preview" />
                        <div className="badge-preview-meta">
                          <div className="badge-preview-title">Preview badge: {asset.title}</div>
                          <div className="badge-preview-note">This is what employees will claim after completion.</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Questions Section */}
              <div className="content-section">
                <h2 className="section-title">Questions</h2>

                <div className="question-type-buttons">
                  <button 
                    className="question-type-btn"
                    onClick={() => addQuestion("mcq")}
                  >
                    <span className="btn-icon">✓</span>
                    Add Multiple Choice
                  </button>
                  <button 
                    className="question-type-btn"
                    onClick={() => addQuestion("tf")}
                  >
                    <span className="btn-icon">✗</span>
                    Add True/False
                  </button>
                  <button 
                    className="question-type-btn"
                    onClick={() => addQuestion("short")}
                  >
                    <span className="btn-icon">?</span>
                    Add Short Answer
                  </button>
                </div>

                <div className="questions-list">

            {/* Badge section removed */}
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

                  {/* Add Question buttons at bottom */}
                  <div className="question-type-buttons bottom">
                    <button 
                      className="question-type-btn"
                      onClick={() => addQuestion("mcq")}
                    >
                      <span className="btn-icon">✓</span>
                      Add Multiple Choice
                    </button>
                    <button 
                      className="question-type-btn"
                      onClick={() => addQuestion("tf")}
                    >
                      <span className="btn-icon">✗</span>
                      Add True/False
                    </button>
                    <button 
                      className="question-type-btn"
                      onClick={() => addQuestion("short")}
                    >
                      <span className="btn-icon">?</span>
                      Add Short Answer
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Right Sidebar */}
        <div className="content-right">
          {/* Employee completion preview */}
          <div className="content-section">
            <h2 className="section-title">Employee Completion Preview</h2>
            {(() => {
              const asset = badgeAssetForDifficulty(difficulty);
              return (
                <div className="employee-complete-card">
                  <div className="employee-complete-left">
                    <img src={asset.image} alt={asset.title} className="employee-complete-badge" />
                  </div>
                  <div className="employee-complete-right">
                    <h3>Congratulations! 🎉</h3>
                    <p>
                      This is how it will look when an employee completes "{title || "Your quiz title"}".
                      They’ll be able to claim a {difficulty} badge like this one.
                    </p>
                    <div className="employee-complete-actions">
                      <button className="btn btn-primary" disabled>Claim Badge</button>
                      <button className="btn btn-outline" disabled>View Badges</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <PreviewModal quiz={previewOf} onClose={() => setPreviewOf(null)} />
    </div>
  );
}
