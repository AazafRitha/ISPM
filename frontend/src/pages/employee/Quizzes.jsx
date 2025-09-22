// Author: Aazaf Ritha
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { quizApi } from "../../api/quizzes";
import "./Quizzes.css";
// Removed old banner image usage; no publicUrl needed
import { badgeAssetForDifficulty } from "../../lib/badges";

export default function Quizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError("");
        // Only load published quizzes
        const data = await quizApi.list({ status: "published" });
        setQuizzes(data);
      } catch (err) {
        setError(err.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || quiz.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "#10b981";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "#6b7280";
    }
  };

  // Removed emojis for difficulty indicator per request

  return (
    <>
      <Header />
      <div className="quizzes-container">
        <div className="quizzes-header">
          <h1>Training Quizzes</h1>
          <p>
            Test your knowledge with our interactive quizzes. Complete quizzes to earn badges 
            and track your learning progress.
          </p>
        </div>

        <div className="quizzes-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading quizzes...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredQuizzes.length === 0 && (
          <div className="no-quizzes">
            <h3>No Quizzes Found</h3>
            <p>No quizzes match your search criteria.</p>
          </div>
        )}

        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id || quiz.id} className="quiz-card">
              {/* Difficulty-based banner replacing old image banner */}
              <div className={`quiz-card-banner diff-${quiz.difficulty || 'medium'}`}>
                <div className="quiz-card-banner-title">{quiz.title}</div>
              </div>

              <div className="quiz-card-content">
                <div className="quiz-header">
                  {/* Keep semantic title but hide visually to avoid duplication; banner shows title */}
                  <h3 className="quiz-title visually-hidden">{quiz.title}</h3>
                  <div className="quiz-difficulty">
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                    >
                      {quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1)}
                    </span>
                    <span className="category-chip">
                      {(quiz.category || 'general').charAt(0).toUpperCase() + (quiz.category || 'general').slice(1)}
                    </span>
                  </div>
                </div>

                {quiz.description && (
                  <p className="quiz-description">{quiz.description}</p>
                )}

                <div className="quiz-meta">
                  <div className="meta-item">
                    <span className="meta-text">{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-text">
                      {quiz.timeLimit ? `${quiz.timeLimit} min` : "No time limit"}
                    </span>
                  </div>
                </div>

                {/* What employee will get after completion */}
                {(() => {
                  const asset = badgeAssetForDifficulty(quiz.difficulty);
                  return (
                    <div className="quiz-earn-hint">
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="badge-thumb"
                        loading="lazy"
                      />
                      <span>
                        Earn after completion: <strong>{asset.title}</strong>
                      </span>
                    </div>
                  );
                })()}

                {quiz.badgeTitle && (
                  <div className="quiz-badge">
                    <span className="badge-text">Earn: {quiz.badgeTitle}</span>
                  </div>
                )}

                <div className="quiz-card-footer">
                  <button
                    onClick={() => navigate(`/employee/quizzes/${quiz._id || quiz.id}`)}
                    className="start-quiz-btn"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
