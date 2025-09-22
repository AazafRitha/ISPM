import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { employeeApi } from '../../api/employee';
import { contentApi } from '../../api/content';
import { quizApi } from '../../api/quizzes';
import { policyApi } from '../../api/policy';
import './Dashboard.css';

const Dashboard = () => {
  const [employee, setEmployee] = useState({
    name: 'Loading...',
    email: '',
    department: '',
    joinDate: ''
  });

  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch employee data from database
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch employees, published content, published quizzes, and policies in parallel
        const [employees, publishedContent, publishedQuizzes, allPolicies] = await Promise.all([
          employeeApi.list(),
          contentApi.list({ status: 'published' }),
          quizApi.list({ status: 'published' }),
          policyApi.list()
        ]);

        // Determine current employee from localStorage or fall back to first
        let currentEmployee;
        const selectedEmployee = localStorage.getItem('selectedEmployee');
        if (selectedEmployee) {
          currentEmployee = JSON.parse(selectedEmployee);
        } else if (employees && employees.length > 0) {
          currentEmployee = employees[0];
        }

        if (currentEmployee) {
          setEmployee({
            name: currentEmployee.name || 'Unknown Employee',
            email: currentEmployee.email || '',
            department: currentEmployee.department || 'General',
            joinDate: currentEmployee.createdAt || new Date().toISOString()
          });

          // Leaderboard with real employees (no fake scores)
          setLeaderboard((employees || []).map(emp => ({
            name: emp.name || 'Unknown',
            department: emp.department || 'General'
          })));

          // Training modules from published educational content
          setTrainingModules((publishedContent || []).map(c => ({
            id: c._id,
            title: c.title,
            description: c.type ? `${c.type.toUpperCase()} content` : ''
          })));

          // Assessments from published quizzes
          setAssessments((publishedQuizzes || []).map(q => ({
            id: q._id,
            title: q.title,
            description: q.description,
            questions: Array.isArray(q.questions) ? q.questions.length : (q.questionCount || 0),
            timeLimit: q.timeLimit
          })));

          // Policies list
          setPolicies(allPolicies || []);
        } else {
          setError('No employees found in database');
        }
      } catch (err) {
        console.error('Error loading employee data:', err);
        setError(err.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, []);

  const [leaderboard, setLeaderboard] = useState([]);

  const [securityAlerts] = useState([]);

  const [trainingModules, setTrainingModules] = useState([]);

  const [assessments, setAssessments] = useState([]);

  const [policies, setPolicies] = useState([]);

  const [achievements, setAchievements] = useState([]);

  // Helpers not needed for DB-driven simplified UI

  if (loading) {
    return (
      <>
        <Header />
        <div className="employee-dashboard">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Loading your dashboard...</p>
            </div>
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
        <div className="employee-dashboard">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Error Loading Dashboard</h3>
              <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>{error}</p>
              <button 
                className="btn" 
                onClick={() => window.location.reload()}
                style={{ marginRight: '1rem' }}
              >
                Retry
              </button>
              <Link to="/" className="btn">
                Go Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="employee-dashboard">
        {/* Employee Header (matches Admin header style) */}
        <div className="emp-header">
          <div className="emp-header-left">
            <h1 className="emp-title">Employee Dashboard</h1>
            <p className="emp-subtitle">Track your learning and security awareness</p>
          </div>
          <div className="emp-header-right">
            <Link to="/employee/learn" className="emp-btn emp-btn-outline" title="Continue learning">
              📚 Continue Learning
            </Link>
            <Link to="/employee/quizzes" className="emp-btn emp-btn-outline" title="Take a quiz">
              📝 Take Quiz
            </Link>
            <Link to="/employee/badges" className="emp-btn emp-btn-primary" title="View your badges">
              🏆 My Badges
            </Link>
            <Link to="/employee/profile" className="emp-btn emp-btn-outline" title="Edit my profile">
              👤 My Profile
            </Link>
            <span className="emp-welcome">Welcome, {employee.name || 'Employee'}</span>
            <div className="emp-avatar">{(employee.name || 'E').charAt(0).toUpperCase()}</div>
          </div>
        </div>

        {/* KPI Cards from DB */}
        <div className="kpi-grid">
          <div className="card kpi">
            <div className="kpi-title">Available Content</div>
            <div className="kpi-value">{trainingModules.length}</div>
            <div className="kpi-more">Published</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Quizzes Available</div>
            <div className="kpi-value">{assessments.length}</div>
            <div className="kpi-more">Published</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Policies</div>
            <div className="kpi-value">{policies.length}</div>
            <div className="kpi-more">Active</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Employees</div>
            <div className="kpi-value">{leaderboard.length}</div>
            <div className="kpi-more">in system</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-col">
          {/* Available Content */}
          <div className="card">
            <h3 className="card-title">Available Content</h3>
            <div className="training-list">
              {trainingModules.slice(0, 5).map(module => (
                <div key={module.id} className="training-item">
                  <div className="training-info">
                    <h4 className="training-title">{module.title}</h4>
                    <p className="training-description">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/employee/learn" className="ql">
              View All Content
            </Link>
          </div>

          {/* Employees */}
          <div className="card">
            <h3 className="card-title">Employees</h3>
            <div className="leaderboard-list">
              {leaderboard.slice(0, 8).map((user) => (
                <div key={user.name} className="leaderboard-item">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-department">{user.department}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assessments */}
        <div className="card">
          <h3 className="card-title">Assessments</h3>
          <div className="assessments-list">
            {assessments.slice(0, 5).map(assessment => (
              <div key={assessment.id} className="assessment-item">
                <div className="assessment-info">
                  <h4 className="assessment-title">{assessment.title}</h4>
                  <div className="assessment-details">
                    <span>{assessment.questions} questions</span>
                    <span>{assessment.timeLimit ? `${assessment.timeLimit} min` : 'No time limit'}</span>
                  </div>
                </div>
                <div className="assessment-status">
                  <div className="incomplete-info">
                    <Link to={`/employee/quizzes`} className="btn">
                      Take Quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/employee/quizzes" className="ql">
            View All Assessments
          </Link>
        </div>

        {/* Policies (from DB) */}
        {policies.length > 0 && (
          <div className="card">
            <h3 className="card-title">Policies</h3>
            <div className="policies-list">
              {policies.slice(0, 5).map(p => (
                <div key={p._id} className="policy-item">
                  <div className="policy-info">
                    <div className="policy-title">{p.title}</div>
                    <div className="policy-meta">
                      <span>{p.version || 'v1.0'}</span>
                      <span>{p.category || 'General'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/employee/policies" className="ql">
              View All Policies
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="card">
          <h3 className="card-title">Quick Links</h3>
          <div className="quick-links">
            <Link className="ql" to="/employee/learn">Educational Content</Link>
            <Link className="ql" to="/employee/quizzes">Training Quizzes</Link>
            <Link className="ql" to="/employee/badges">My Badges</Link>
            <Link className="ql" to="/employee/policies">Company Policies</Link>
            <Link className="ql" to="/employee/profile">My Profile</Link>
            <Link className="ql" to="/learn">Public Learning</Link>
            <Link className="ql" to="/contact">Contact Support</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
