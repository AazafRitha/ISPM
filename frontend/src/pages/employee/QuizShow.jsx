// Author: Aazaf Ritha
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { quizApi } from "../../api/quizzes";
import "./QuizShow.css";

export default function QuizShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) {
        setError("Quiz ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await quizApi.getOne(id);
        setQuiz(data);
        if (data.timeLimitMin) {
          setTimeLeft(data.timeLimitMin * 60); // Convert minutes to seconds
        }
      } catch (err) {
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (!quizStarted || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;

      if (question.type === "short") {
        // For short answers, we'll consider it correct if answered
        correctAnswers++;
      } else if (question.type === "tf" || question.type === "mcq" || question.type === "single") {
        // Check if the selected option is correct
        const selectedOption = question.options?.find(opt => opt.id === userAnswer);
        if (selectedOption?.isCorrect) {
          correctAnswers++;
        }
      }
    });

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "#10b981";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getScoreColor = (score) => {
    if (score >= quiz?.passingScore) return "#10b981";
    return "#ef4444";
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="quiz-show-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading quiz...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="quiz-show-container">
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate("/employee/quizzes")} className="back-btn">
              ← Back to Quizzes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <Header />
        <div className="quiz-show-container">
          <div className="no-quiz">
            <h3>Quiz Not Found</h3>
            <p>The quiz you are looking for does not exist or is unavailable.</p>
            <button onClick={() => navigate("/employee/quizzes")} className="back-btn">
              ← Back to Quizzes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (quizCompleted) {
    return (
      <>
        <Header />
        <div className="quiz-show-container">
          <div className="quiz-results">
            <div className="results-header">
              <h1>Quiz Completed!</h1>
              <div className="score-display" style={{ color: getScoreColor(score) }}>
                <span className="score-number">{score}%</span>
                <span className="score-label">
                  {score >= quiz.passingScore ? "Passed!" : "Failed"}
                </span>
              </div>
            </div>

            <div className="results-details">
              <div className="result-item">
                <span className="result-label">Quiz:</span>
                <span className="result-value">{quiz.title}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Passing Score:</span>
                <span className="result-value">{quiz.passingScore}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">Your Score:</span>
                <span className="result-value">{score}%</span>
              </div>
              {quiz.badgeTitle && (
                <div className="result-item">
                  <span className="result-label">Badge:</span>
                  <span className="result-value">{quiz.badgeTitle}</span>
                </div>
              )}
            </div>

            {score >= quiz.passingScore && quiz.badgeTitle && (
              <div className="badge-earned">
                <div className="badge-icon">🏆</div>
                <h3>Congratulations!</h3>
                <p>You've earned the <strong>{quiz.badgeTitle}</strong> badge!</p>
                {quiz.badgeDescription && (
                  <p className="badge-description">{quiz.badgeDescription}</p>
                )}
              </div>
            )}

            <div className="results-actions">
              <button onClick={() => navigate("/employee/quizzes")} className="btn btn-primary">
                Back to Quizzes
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-outline">
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <Header />
        <div className="quiz-show-container">
          <div className="quiz-intro">
            {quiz.bannerImageUrl && (
              <div className="quiz-banner-container">
                <img src={quiz.bannerImageUrl} alt="Quiz Banner" className="quiz-banner-image" />
                <div className="quiz-banner-overlay"></div>
              </div>
            )}
            
            <div className="quiz-info">
              <h1 className="quiz-title">{quiz.title}</h1>
              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}
              
              <div className="quiz-meta">
                <div className="meta-item">
                  <span className="meta-label">Difficulty:</span>
                  <span 
                    className="meta-value difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                  >
                    {quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Questions:</span>
                  <span className="meta-value">{quiz.questions?.length || 0}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Time Limit:</span>
                  <span className="meta-value">
                    {quiz.timeLimitMin ? `${quiz.timeLimitMin} minutes` : "No time limit"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Passing Score:</span>
                  <span className="meta-value">{quiz.passingScore}%</span>
                </div>
              </div>

              <div className="quiz-instructions">
                <h3>Instructions:</h3>
                <ul>
                  <li>Read each question carefully</li>
                  <li>Select the best answer for each question</li>
                  <li>You can change your answers before submitting</li>
                  {quiz.timeLimitMin && (
                    <li>You have {quiz.timeLimitMin} minutes to complete the quiz</li>
                  )}
                  <li>You need {quiz.passingScore}% to pass</li>
                </ul>
              </div>

              <button onClick={startQuiz} className="start-quiz-btn">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <>
      <Header />
      <div className="quiz-show-container">
        <div className="quiz-header">
          <button onClick={() => navigate("/employee/quizzes")} className="back-btn">
            ← Back to Quizzes
          </button>
          <h1 className="quiz-title">{quiz.title}</h1>
          {timeLeft && (
            <div className="timer" style={{ color: timeLeft < 60 ? "#ef4444" : "#111827" }}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>

        <div className="quiz-question">
          <div className="question-header">
            <h2 className="question-title">{currentQ.stem}</h2>
            <span className="question-type">{currentQ.type}</span>
          </div>

          <div className="question-options">
            {currentQ.type === "short" ? (
              <textarea
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                className="short-answer-input"
                rows="4"
              />
            ) : (
              currentQ.options?.map((option, index) => (
                <label key={option.id} className="option-label">
                  <input
                    type={currentQ.type === "mcq" ? "checkbox" : "radio"}
                    name={`question-${currentQ.id}`}
                    value={option.id}
                    checked={answers[currentQ.id] === option.id || 
                             (currentQ.type === "mcq" && answers[currentQ.id]?.includes(option.id))}
                    onChange={(e) => {
                      if (currentQ.type === "mcq") {
                        const currentAnswers = answers[currentQ.id] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option.id]
                          : currentAnswers.filter(id => id !== option.id);
                        handleAnswerChange(currentQ.id, newAnswers);
                      } else {
                        handleAnswerChange(currentQ.id, option.id);
                      }
                    }}
                    className="option-input"
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          <span className="question-counter">
            {currentQuestion + 1} / {quiz.questions.length}
          </span>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="nav-btn submit-btn"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
