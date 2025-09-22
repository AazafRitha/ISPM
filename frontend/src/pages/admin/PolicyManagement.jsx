import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyApi } from '../../api/policy';
import './PolicyManagement.css';

const PolicyManagement = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    category: 'security',
    isRequired: false,
    file: null
  });

  useEffect(() => {
    loadPolicies();
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingPolicy) {
        await policyApi.update(editingPolicy._id, formData);
      } else {
        await policyApi.create(formData);
      }
      setShowCreateForm(false);
      setEditingPolicy(null);
      setFormData({
        title: '',
        description: '',
        version: '',
        category: 'security',
        isRequired: false,
        file: null
      });
      loadPolicies();
    } catch (err) {
      console.error('Error saving policy:', err);
      setError(err.message || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description,
      version: policy.version,
      category: policy.category,
      isRequired: policy.isRequired,
      file: null
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await policyApi.delete(id);
        loadPolicies();
      } catch (err) {
        console.error('Error deleting policy:', err);
        setError(err.message || 'Failed to delete policy');
      }
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

  return (
    <div className="policy-management">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Policy Management</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Content Header */}
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-main-title">Company Policies</h1>
          <p className="content-subtitle">Upload and manage company policies for employees to access and download.</p>
        </div>
        <div className="content-header-actions">
          <button
            className="new-policy-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + New Policy
          </button>
        </div>
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

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</h2>
              <button
                className="close-form"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPolicy(null);
                  setFormData({
                    title: '',
                    description: '',
                    version: '',
                    category: 'security',
                    isRequired: false,
                    file: null
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="policy-form">
              <div className="form-group">
                <label className="form-label required">Policy Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter policy title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter policy description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Version *</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., v1.0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="security">Security</option>
                    <option value="hr">HR</option>
                    <option value="it">IT</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Required Policy (Employees must read this)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label required">Policy File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="file-input"
                  required={!editingPolicy}
                />
                <p className="file-help">Supported formats: PDF, DOC, DOCX</p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPolicy(null);
                    setFormData({
                      title: '',
                      description: '',
                      version: '',
                      category: 'security',
                      isRequired: false,
                      file: null
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policies List */}
      <div className="policies-section">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading policies...</p>
          </div>
        ) : filteredPolicies.length === 0 ? ( 
          <div className="no-policies"> 
            <div className="no-policies-icon" aria-hidden="true"></div>
            <h3>No Policies Found</h3>
            <p>No policies match your search criteria.</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create First Policy
            </button>
          </div>
        ) : (
          <div className="policies-grid">
            {filteredPolicies.map((policy) => (
              <div key={policy._id} className="policy-card">
                <div className="policy-header">
                  <div className="policy-category" style={{ backgroundColor: getCategoryColor(policy.category) }}>
                    {policy.category.toUpperCase()}
                  </div>
                  <div className="policy-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(policy)}
                      title="Edit Policy"
                    >
                 Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(policy._id)}
                      title="Delete Policy"
                    >
                 Delete
                    </button>
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

                  {policy.isRequired && (
                    <div className="required-badge">Required</div>
                  )}
                </div>

                <div className="policy-footer">
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
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;
