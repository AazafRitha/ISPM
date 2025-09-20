import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { contentApi } from "../../api/content";
import "./Learn.css";

export default function Learn() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");
        // Only load published content
        const data = await contentApi.list({ status: "published", type: filterType });
        setContent(data);
      } catch (err) {
        setError(err.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [filterType]);

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case "youtube":
        return "🎥";
      case "pdf":
        return "📄";
      case "blog":
        return "📝";
      case "writeup":
        return "📋";
      default:
        return "📚";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "youtube":
        return "#ff0000";
      case "pdf":
        return "#dc2626";
      case "blog":
        return "#059669";
      case "writeup":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  return (
    <>
      <Header />
      <div className="learn-container">
        <div className="learn-header">
          <h1>Educational Content</h1>
          <p>
            Welcome to our learning hub! Here you can access educational materials, 
            videos, and resources to improve your cybersecurity knowledge.
          </p>
        </div>

        <div className="learn-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="youtube">YouTube Videos</option>
              <option value="pdf">PDF Documents</option>
              <option value="blog">Blog Posts</option>
              <option value="writeup">Write-ups</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading educational content...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredContent.length === 0 && (
          <div className="no-content">
            <h3>No Content Found</h3>
            <p>No educational content matches your search criteria.</p>
          </div>
        )}

        <div className="content-grid">
          {filteredContent.map((item) => (
            <div key={item._id || item.id} className="content-card">
              <div className="content-card-header">
                <div className="content-type-badge" style={{ backgroundColor: getTypeColor(item.type) }}>
                  <span className="type-icon">{getTypeIcon(item.type)}</span>
                  <span className="type-text">{item.type}</span>
                </div>
                <div className="content-date">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="content-card-body">
                <h3 className="content-title">{item.title}</h3>
                <p className="content-description">{item.description}</p>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="content-tags">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="tag-more">+{item.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="content-card-footer">
                <button
                  onClick={() => navigate(`/employee/learn/${item._id || item.id}`)}
                  className="learn-btn"
                >
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
