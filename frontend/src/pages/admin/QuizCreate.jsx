// Author: Aazaf Ritha
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../../api/quizzes";
import QuestionCard from "../../components/QuestionCard";
import "./QuizCreate.css";
import { badgeAssetForDifficulty } from "../../lib/badges";

const uid = () => Math.random().toString(36).slice(2, 10);

function PreviewModal({ quiz, onClose }) {
  if (!quiz) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Preview: {quiz.title}</h3>
            <p className="modal-subtitle">
              Time limit: {quiz.timeLimitMin ? `${quiz.timeLimitMin} min` : "none"} · Pass: {quiz.passingScore}%
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

export default function QuizCreate() {
  const nav = useNavigate();

  // Quiz meta
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Banner removed
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimitMin, setTimeLimitMin] = useState(30);
  const [passingScore, setPassingScore] = useState(70);

  // Badge removed

  // Questions
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previewOf, setPreviewOf] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState("");

  const addQuestion = (type) => {
    const newQuestion = {
      id: uid(),
      type: type,
      stem: "",
      explanation: "",
      options: type === "tf" ? [
        { id: uid(), text: "True", isCorrect: false },
        { id: uid(), text: "False", isCorrect: false }
      ] : [],
      points: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id, next) =>
    setQuestions(prev => prev.map(q => q.id === id ? next : q));
  const removeQuestion = (id) =>
    setQuestions(prev => prev.filter(q => q.id !== id));

  // Banner and badge upload handlers removed

  const isBlobUrl = (u) => typeof u === 'string' && u.startsWith('blob:');
  const draft = useMemo(() => ({
    title,
    description,
    difficulty,
    timeLimitMin: Number(timeLimitMin) || null,
    passingScore: Number(passingScore) || 70,
    status: "draft",
    questions,
    totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0)
  }), [title, description, difficulty, timeLimitMin, passingScore, questions]);

  // Validation helper
  const getValidationIssues = () => {
    const issues = [];
    if (!title.trim()) issues.push("Quiz title is required");
    if (questions.length === 0) issues.push("At least one question is required");
    
    questions.forEach((q, idx) => {
      if (!q.stem?.trim()) {
        issues.push(`Question ${idx + 1}: Question text is required`);
      } else if (q.type === "mcq") {
        if (!q.options?.length || !q.options.some(o => o.isCorrect)) {
          issues.push(`Question ${idx + 1}: Multiple choice needs at least one correct option`);
        }
        if ((q.options?.length || 0) < 2) {
          issues.push(`Question ${idx + 1}: Multiple choice needs at least 2 options`);
        }
      } else if (q.type === "tf" && (!q.options?.length || !q.options.some(o => o.isCorrect))) {
        issues.push(`Question ${idx + 1}: True/False needs a correct answer selected`);
      }
    });
    
    return issues;
  };

  const validationIssues = getValidationIssues();
  const canSave = validationIssues.length === 0;

  // Transform frontend data structure to backend format
  const transformQuizForBackend = (quiz) => {
    return {
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: Number(quiz.timeLimitMin) || 0,
      passingScore: Number(quiz.passingScore) || 70,
      status: quiz.status,
      questions: quiz.questions.map(q => {
        // Normalize type: treat 'single' as 'mcq' in backend
        const normalizedType = q.type === 'single' ? 'mcq' : q.type;
        // Convert frontend question format to backend format
        const backendQuestion = {
          question: q.stem,
          type: normalizedType === "mcq" ? "multiple-choice" : 
                normalizedType === "tf" ? "true-false" : 
                normalizedType === "short" ? "text" : normalizedType,
          explanation: q.explanation || "",
          points: q.points || 1
        };

        if (normalizedType === "mcq") {
          // Multiple choice: extract options and find correct answer
          const opts = (q.options || []).map(opt => ({ ...opt }));
          // Ensure only one correct answer for single/mcq
          const firstCorrect = opts.findIndex(o => o.isCorrect);
          backendQuestion.options = opts.map(opt => opt.text);
          const correctIndex = firstCorrect >= 0 ? firstCorrect : 0;
          backendQuestion.correctAnswer = correctIndex >= 0 ? correctIndex.toString() : "0";
        } else if (normalizedType === "tf") {
          // True/False: options array and correct answer
          const opts = (q.options || []).map(opt => ({ ...opt }));
          backendQuestion.options = opts.map(opt => opt.text);
          const correctOption = opts.find(opt => opt.isCorrect);
          backendQuestion.correctAnswer = correctOption ? correctOption.text : "True";
        } else if (normalizedType === "short") {
          // Short answer: no options needed, correctAnswer can be empty for manual grading
          backendQuestion.options = [];
          backendQuestion.correctAnswer = ""; // Will need manual grading
        }

        return backendQuestion;
      })
    };
  };

  const save = async () => {
    if (!canSave) {
      console.warn("Cannot save quiz: validation failed");
      return;
    }
    
    setSaving(true);
    try {
      const backendPayload = transformQuizForBackend(draft);
      console.log("Saving quiz with payload:", JSON.stringify(backendPayload, null, 2));
      
      const result = await quizApi.create(backendPayload);
      console.log("Quiz saved successfully:", result);
      nav("/admin/quizzes");
    } catch (e) {
      console.error("Save error full object:", e);
      console.error("Save error message:", e.message);
      
      let errorMessage = e.message || "Unknown error";
      if (e.data) {
        errorMessage = e.data.error || e.data.message || errorMessage;
        if (e.data.details) {
          errorMessage += "\nDetails: " + e.data.details.join(", ");
        }
      }
      alert(`Failed to save quiz:\n${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canSave) {
      console.warn("Cannot publish quiz - validation failed");
      return;
    }
    
    setSaving(true);
    try {
      const backendPayload = transformQuizForBackend(draft);
      console.log("Publishing quiz with payload:", backendPayload);
      
      const quiz = await quizApi.create(backendPayload);
      console.log("Quiz created:", quiz);
      
      const publishResult = await quizApi.publish(quiz._id || quiz.id);
      console.log("Quiz published:", publishResult);
      
      nav("/admin/quizzes");
    } catch (e) {
      console.error("Publish error full object:", e);
      console.error("Publish error message:", e.message);
      let errorMessage = e.message || "Unknown error";
      if (e.data) {
        errorMessage = e.data.error || e.data.message || errorMessage;
        if (e.data.details) {
          errorMessage += "\nDetails: " + e.data.details.join(", ");
        }
      }
      alert(`Failed to publish quiz:\n${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="quiz-create-page">
      {/* Top Header Bar */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button 
            className="preview-btn"
            onClick={() => setPreviewOf(draft)} 
            disabled={!canSave}
            title={!canSave ? `Cannot preview: ${validationIssues[0]}` : "Preview quiz"}
          >
            <span className="btn-icon">👁️</span>
            Preview
          </button>
          <button 
            className="save-draft-btn"
            onClick={save} 
            disabled={!canSave || saving}
            title={!canSave ? `Cannot save: ${validationIssues[0]}` : saving ? "Saving..." : "Save as draft"}
          >
            <span className="btn-icon">💾</span>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            className="publish-btn"
            onClick={publish} 
            disabled={!canSave || saving}
            title={!canSave ? `Cannot publish: ${validationIssues[0]}` : saving ? "Publishing..." : "Publish quiz live"}
          >
            {saving ? "Publishing..." : "Publish Quiz"}
          </button>
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
          {/* Difficulty-based Banner Preview */}
          <div className={`banner-preview-strip diff-${difficulty}`}>
            <div className="banner-preview-title">{title || "Your Quiz Title"}</div>
          </div>
          {/* Header Section */}
          <div className="content-header-section">
            <button className="back-btn" onClick={() => nav("/admin/quizzes")}>
              ← Back
            </button>
            <div className="header-content">
              <h1 className="content-main-title">Create New Quiz</h1>
              <p className="content-subtitle">Design engaging quizzes for your teams.</p>
            </div>
          </div>

          {/* Quiz Information */}
          <div className="content-section">
            <h2 className="section-title">Quiz Information</h2>
            
            <div className="form-group">
              <label className="form-label required">Quiz Title *</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Enter quiz title..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                placeholder="Describe what this quiz covers..."
              />
            </div>

            {/* Banner removed */}


            <div className="form-grid">
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
              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input 
                  type="number" 
                  min={0} 
                  value={timeLimitMin} 
                  onChange={(e) => setTimeLimitMin(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={passingScore} 
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

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

            {/* Questions Section */}
            <div className="content-section">
              <div className="questions-header">
                <h2 className="section-title">Questions ({questions.length})</h2>
                <div className="total-points">Total Points: {draft.totalPoints}</div>
              </div>

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
                    <div className="empty-icon">?</div>
                    <p>No questions added yet. Use the buttons above to add your first question.</p>
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
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="content-right">
          {/* Validation Status */}
          {validationIssues.length > 0 && (
            <div className="content-section">
              <h2 className="section-title" style={{color: '#e74c3c'}}>⚠️ Validation Issues</h2>
              <ul style={{color: '#e74c3c', fontSize: '0.875rem', lineHeight: '1.4'}}>
                {validationIssues.map((issue, idx) => (
                  <li key={idx} style={{marginBottom: '0.25rem'}}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quiz Summary */}
          <div className="content-section">
            <h2 className="section-title">Quiz Summary</h2>
            
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Questions:</span>
                <span className="stat-value">{questions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Points:</span>
                <span className="stat-value">{draft.totalPoints}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Limit:</span>
                <span className="stat-value">{timeLimitMin} min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Passing Score:</span>
                <span className="stat-value">{passingScore}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className="stat-value" style={{color: canSave ? '#27ae60' : '#e74c3c'}}>
                  {canSave ? '✓ Ready to save' : '⚠️ Has issues'}
                </span>
              </div>
            </div>
          </div>

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

      {/* Image Lightbox */}
      {lightboxSrc && (
        <div className="modal-overlay" onClick={() => setLightboxSrc("")}>
          <div className="image-lightbox" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxSrc} alt="Full preview" className="image-lightbox-img" />
            <button className="close-btn" onClick={() => setLightboxSrc("")}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
