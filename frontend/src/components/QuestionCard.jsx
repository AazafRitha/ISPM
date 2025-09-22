// Author: Aazaf Ritha
import { useState } from "react";
import "./QuestionCard.css";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function QuestionCard({ q, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  const addOption = () => {
    const next = {
      ...q,
      options: [...(q.options || []), { id: uid(), text: "", isCorrect: false }]
    };
    onChange(next);
  };

  const updatePoints = (points) => {
    onChange({ ...q, points: Number(points) || 1 });
  };

  const updateOption = (oid, updates) => {
    const next = {
      ...q,
      options: (q.options || []).map(o => o.id === oid ? { ...o, ...updates } : o)
    };
    onChange(next);
  };

  const removeOption = (oid) => {
    const next = {
      ...q,
      options: (q.options || []).filter(o => o.id !== oid)
    };
    onChange(next);
  };

  const setCorrect = (oid) => {
    if (q.type === "single" || q.type === "tf") {
      // Only one correct answer allowed
      const next = {
        ...q,
        options: (q.options || []).map(o => ({ ...o, isCorrect: o.id === oid }))
      };
      onChange(next);
    } else {
      // Multiple correct answers allowed
      updateOption(oid, { isCorrect: !q.options.find(o => o.id === oid)?.isCorrect });
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-controls">
          <select
            value={q.type || "mcq"}
            onChange={(e) => onChange({ ...q, type: e.target.value })}
            className="question-type-select"
          >
            <option value="mcq">Multiple Choice</option>
            <option value="tf">True/False</option>
            <option value="short">Short Answer</option>
          </select>
          <div className="points-input">
            <label className="points-label">Points:</label>
            <input
              type="number"
              min="1"
              value={q.points || 1}
              onChange={(e) => updatePoints(e.target.value)}
              className="points-field"
            />
          </div>
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "−" : "+"}
          </button>
          <button
            className="remove-btn"
            onClick={onRemove}
          >
            ×
          </button>
        </div>
      </div>

      <div className="question-content">
        <textarea
          value={q.stem || ""}
          onChange={(e) => onChange({ ...q, stem: e.target.value })}
          placeholder="Enter your question here..."
          className="question-stem"
          rows="2"
        />

        {expanded && (
          <div className="question-details">
            <textarea
              value={q.explanation || ""}
              onChange={(e) => onChange({ ...q, explanation: e.target.value })}
              placeholder="Explanation (optional)"
              className="question-explanation"
              rows="2"
            />
          </div>
        )}

        {q.type !== "short" && (
          <div className="options-section">
            <div className="options-header">
              <span className="options-label">Options</span>
              {q.type !== "tf" && (
                <button
                  className="add-option-btn"
                  onClick={addOption}
                >
                  + Add Option
                </button>
              )}
            </div>

            <div className="options-list">
              {(q.options || []).map((option, index) => (
                <div key={option.id} className="option-item">
                  <div className="option-controls">
                    <button
                      className={`correct-btn ${option.isCorrect ? 'correct' : ''}`}
                      onClick={() => setCorrect(option.id)}
                    >
                      {option.isCorrect ? "✓" : "○"}
                    </button>
                    <span className="option-number">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, { text: e.target.value })}
                    placeholder="Option text..."
                    className="option-input"
                  />
                  <button
                    className="remove-option-btn"
                    onClick={() => removeOption(option.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {q.type === "tf" && (q.options || []).length !== 2 && (
              <div className="tf-hint">
                True/False questions need exactly 2 options.
              </div>
            )}
          </div>
        )}

        {q.type === "short" && (
          <div className="short-answer-hint">
            This is a short answer question. Students will type their response.
          </div>
        )}
      </div>
    </div>
  );
}
