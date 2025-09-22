import React, { useState, useEffect } from 'react';
import { policyApi } from '../../api/policy';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './Policies.css';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [readPolicies, setReadPolicies] = useState(new Set());

  useEffect(() => {
    loadPolicies();
    loadReadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await policyApi.list();
      setPolicies(data);
    } catch (err) {
      console.error('Error loading policies:', err);
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const loadReadPolicies = () => {
    const read = localStorage.getItem('readPolicies');
    if (read) {
      setReadPolicies(new Set(JSON.parse(read)));
    }
  };

  const handleDownload = async (policy) => {
    try {
      const blob = await policyApi.download(policy._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${policy.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading policy:', err);
      setError(err.message || 'Failed to download policy');
    }
  };

  const handleMarkAsRead = (policyId) => {
    const newReadPolicies = new Set(readPolicies);
    newReadPolicies.add(policyId);
    setReadPolicies(newReadPolicies);
    localStorage.setItem('readPolicies', JSON.stringify([...newReadPolicies]));
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || policy.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'security': return '#e74c3c';
      case 'hr': return '#3498db';
      case 'it': return '#9b59b6';
      case 'compliance': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return '#e74c3c';
      case 'hr': return '#3498db';
      case 'it': return '#9b59b6';
      case 'compliance': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const requiredPolicies = filteredPolicies.filter(policy => policy.isRequired);
  const otherPolicies = filteredPolicies.filter(policy => !policy.isRequired);

  return (
    <>
      <Header />
      <div className="policies-page">
        <div className="policies-container">
          {/* Header */}
          <div className="policies-header">
            <h1>Company Policies</h1>
            <p>Access and download company policies and guidelines. Please read all required policies.</p>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="security">Security</option>
                <option value="hr">HR</option>
                <option value="it">IT</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError('')} className="close-error">×</button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading policies...</p>
            </div>
          ) : (
            <>
              {/* Required Policies */}
              {requiredPolicies.length > 0 && (
                <div className="policies-section">
                  <div className="section-header">
                    <h2>Required Policies</h2>
                    <p>These policies are mandatory and must be read by all employees.</p>
                  </div>
                  <div className="policies-grid">
                    {requiredPolicies.map((policy) => (
                      <div key={policy._id} className={`policy-card ${readPolicies.has(policy._id) ? 'read' : 'unread'}`}>
                        <div className="policy-header">
                          <div className="policy-category" style={{ backgroundColor: getCategoryColor(policy.category) }}>
                            {policy.category.toUpperCase()}
                          </div>
                          {policy.isRequired && (
                            <div className="required-badge">Required</div>
                          )}
                        </div>

                        <div className="policy-content">
                          <h3 className="policy-title">{policy.title}</h3>
                          <p className="policy-description">{policy.description}</p>
                          
                          <div className="policy-meta">
                            <span className="policy-version">Version: {policy.version}</span>
                            <span className="policy-date">
                              Updated: {new Date(policy.updatedAt || policy.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {readPolicies.has(policy._id) && (
                            <div className="read-status">
                              <span className="read-badge">Read</span>
                            </div>
                          )}
                        </div>

                        <div className="policy-footer">
                          <button
                            className="mark-read-btn"
                            onClick={() => handleMarkAsRead(policy._id)}
                            disabled={readPolicies.has(policy._id)}
                          >
                            {readPolicies.has(policy._id) ? 'Read' : 'Mark as Read'}
                          </button>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(policy)}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Policies */}
              {otherPolicies.length > 0 && (
                <div className="policies-section">
                  <div className="section-header">
                    <h2>Additional Policies</h2>
                    <p>Additional company policies and guidelines for reference.</p>
                  </div>
                  <div className="policies-grid">
                    {otherPolicies.map((policy) => (
                      <div key={policy._id} className={`policy-card ${readPolicies.has(policy._id) ? 'read' : 'unread'}`}>
                        <div className="policy-header">
                          <div className="policy-category" style={{ backgroundColor: getCategoryColor(policy.category) }}>
                            {getCategoryIcon(policy.category)} {policy.category.toUpperCase()}
                          </div>
                        </div>

                        <div className="policy-content">
                          <h3 className="policy-title">{policy.title}</h3>
                          <p className="policy-description">{policy.description}</p>
                          
                          <div className="policy-meta">
                            <span className="policy-version">Version: {policy.version}</span>
                            <span className="policy-date">
                              Updated: {new Date(policy.updatedAt || policy.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {readPolicies.has(policy._id) && (
                            <div className="read-status">
                              <span className="read-badge">✓ Read</span>
                            </div>
                          )}
                        </div>

                        <div className="policy-footer">
                          <button
                            className="mark-read-btn"
                            onClick={() => handleMarkAsRead(policy._id)}
                            disabled={readPolicies.has(policy._id)}
                          >
                            {readPolicies.has(policy._id) ? '✓ Read' : 'Mark as Read'}
                          </button>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(policy)}
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Policies */}
              {filteredPolicies.length === 0 && (
                <div className="no-policies">
                  <div className="no-policies-icon" aria-hidden="true"></div>
                  <h3>No Policies Found</h3>
                  <p>No policies match your search criteria.</p>
                </div>
              )}
            </>
          )}

          {/* Progress Summary */}
          {!loading && policies.length > 0 && (
            <div className="progress-summary">
              <h3>Reading Progress</h3>
              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-number">{readPolicies.size}</span>
                  <span className="stat-label">Read</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{policies.length - readPolicies.size}</span>
                  <span className="stat-label">Unread</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Math.round((readPolicies.size / policies.length) * 100)}%</span>
                  <span className="stat-label">Complete</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Policies;
