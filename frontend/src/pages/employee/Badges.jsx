// Author: Aazaf Ritha
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./Badges.css";
import { listEarnedBadges } from "../../lib/badges";

export default function Badges() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Get employee data from localStorage or API
        const employeeData = localStorage.getItem('employee');
        if (employeeData) {
          setEmployee(JSON.parse(employeeData));
        }
        
        // Load earned badges from local storage (frontend-scope)
        setBadges(listEarnedBadges());
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, []);

  if (loading) {
    return (
      <div className="badges-page">
        <Header />
        <div className="badges-container">
          <div className="loading">Loading your badges...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="badges-page">
        <Header />
        <div className="badges-container">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/employee/learn")} className="btn btn-primary">
              Back to Learning
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="badges-page">
      <Header />
      <div className="badges-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome{employee?.name ? `, ${employee.name}` : ''}!
            </h1>
            <p className="welcome-subtitle">
              Your Achievement Badges
            </p>
            <p className="welcome-description">
              This page displays all the badges you've earned by completing quizzes and training modules. 
              Each badge represents a specific skill or knowledge area you've mastered. 
              Keep learning and earning more badges to showcase your cybersecurity expertise!
            </p>
          </div>
          {employee && (
            <div className="employee-info">
              <div className="employee-avatar">
                {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="employee-details">
                <h3>{employee.name || 'Employee'}</h3>
                <p>{employee.department || 'Department'}</p>
                <p>{employee.position || 'Position'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Page Description */}
        <div className="page-description">
          <h2>About Your Badges</h2>
          <p>
            Badges are digital achievements that recognize your completion of cybersecurity training modules and quizzes. 
            Each badge represents a specific competency in areas like phishing detection, password security, 
            data protection, and more. These badges help track your learning progress and demonstrate your 
            commitment to cybersecurity best practices.
          </p>
          <div className="description-features">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <div>
                <h4>Skill Recognition</h4>
                <p>Each badge represents a specific cybersecurity skill you've mastered</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <div>
                <h4>Progress Tracking</h4>
                <p>Monitor your learning journey and see how far you've come</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <div>
                <h4>Achievement Showcase</h4>
                <p>Display your accomplishments and expertise to colleagues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="badges-section">
          <div className="badges-header">
            <h2>Your Earned Badges ({badges.length})</h2>
            <p>Click on any badge to learn more about the achievement</p>
          </div>

          {badges.length === 0 ? (
            <div className="no-badges">
              <div className="no-badges-icon">🏅</div>
              <h3>No Badges Yet</h3>
              <p>Complete quizzes and training modules to earn your first badge!</p>
              <p className="badge-system-note">
                <strong>Note:</strong> The badge system is currently being set up. 
                Your earned badges will appear here once the system is fully implemented.
              </p>
              <button 
                onClick={() => navigate("/employee/quizzes")} 
                className="btn btn-primary"
              >
                Start Learning
              </button>
            </div>
          ) : (
            <div className="badges-grid">
              {badges.map((b) => (
                <div key={b.id} className="badge-card">
                  <div className="badge-image-container">
                    {b.badgeImage ? (
                      <img src={b.badgeImage} alt={b.badgeTitle} className="badge-image" />
                    ) : (
                      <div className="badge-icon">🏅</div>
                    )}
                  </div>
                  <div className="badge-content">
                    <h3 className="badge-title">{b.badgeTitle || (b.difficulty && `${b.difficulty} badge`)}</h3>
                    <p className="badge-description">Awarded for completing this quiz.</p>
                    <div className="badge-meta">
                      <span className="badge-quiz">Quiz: {b.quizTitle}</span>
                      <span className="badge-date">Earned: {new Date(b.earnedDate).toLocaleDateString()}</span>
                      {typeof b.score === 'number' && (
                        <span className="badge-date">Score: {b.score}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => navigate("/employee/learn")} 
            className="btn btn-outline"
          >
            Continue Learning
          </button>
          <button 
            onClick={() => navigate("/employee/quizzes")} 
            className="btn btn-primary"
          >
            Take Quiz
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
