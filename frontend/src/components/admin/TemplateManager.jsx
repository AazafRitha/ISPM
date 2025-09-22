import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SimulationLauncher from "./SimulationLauncher";
import { Button } from "@mui/material";
import "./TemplateManager.css";

const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]); // ✅ Lift employees here
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // Fetch templates
  const fetchTemplates = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/templates`);
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
    setFetching(false);
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchEmployees(); // fetch once on load
  }, []);

  const handleSave = async () => {
    if (!name || !subject || !htmlContent) return alert("Fill all fields!");
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${BACKEND_URL}/api/templates/${editId}`, { name, subject, htmlContent });
      } else {
        await axios.post(`${BACKEND_URL}/api/templates`, { name, subject, htmlContent });
      }
      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error("Failed to save template:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setName(t.name);
    setSubject(t.subject);
    setHtmlContent(t.htmlContent);
    setOpenForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSubject("");
    setHtmlContent("");
    setOpenForm(false);
  };

  return (
    <div className="template-manager">
      <div className="container">
        <div className="header">
          <h1>Template Manager</h1>
          <Button variant="contained" onClick={() => setOpenForm(true)}>
            Create Template
          </Button>
        </div>

        {fetching ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <div className="list">
            {templates.map((t) => (
              <div key={t._id} className="template-card">
                <div className="card-content">
                  <h3>{t.name}</h3>
                  <p>Subject: {t.subject}</p>

                  <div className="card-actions">
                    <SimulationLauncher
                      simulationName={t.name}
                      subject={t.subject}
                      htmlTemplate={t.htmlContent}
                      onOpen={fetchEmployees} // fetch employees when dialog opens
                      onLaunched={() => { fetchTemplates(); fetchEmployees(); }} // refresh both
                      employees={employees} // ✅ pass down employees
                    />
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/admin/phishing-simulation/stats/${t.name}`)}
                    >
                      View Details
                    </button>
                  </div>

                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(t._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {openForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editId ? "Edit Template" : "Create Template"}</h2>

              <div className="form-group">
                <label>Template Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div className="form-group">
                <label>HTML Content</label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={resetForm}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : editId ? "Update Template" : "Save Template"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
