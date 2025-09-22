import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { employeeApi } from '../../api/employee';
import './EmployeeSelector.css';

const EmployeeSelector = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await employeeApi.list();
        setEmployees(data);
      } catch (err) {
        console.error('Error loading employees:', err);
        setError(err.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleEmployeeSelect = (employee) => {
    // Store selected employee in localStorage for dashboard
    localStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate('/employee/dashboard');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="employee-selector">
          <div className="selector-container">
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading employees...</p>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="employee-selector">
          <div className="selector-container">
            <div className="error">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn">
                Retry
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="employee-selector">
        <div className="selector-container">
          <div className="selector-header">
            <h1>Select Employee Dashboard</h1>
            <p>Choose an employee to view their dashboard and learning progress</p>
          </div>

          <div className="employees-grid">
            {employees.map((employee) => (
              <div 
                key={employee._id} 
                className="employee-card"
                onClick={() => handleEmployeeSelect(employee)}
              >
                <div className="employee-avatar">
                  {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">{employee.name || 'Unknown Employee'}</h3>
                  <p className="employee-email">{employee.email || 'No email'}</p>
                  <p className="employee-id">ID: {employee.employeeID || 'N/A'}</p>
                </div>
                <div className="employee-actions">
                  <button className="view-dashboard-btn">
                    View Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && (
            <div className="no-employees">
              <div className="no-employees-icon">👥</div>
              <h3>No Employees Found</h3>
              <p>No employees are available in the database.</p>
              <p>Please contact your administrator to add employees.</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EmployeeSelector;
