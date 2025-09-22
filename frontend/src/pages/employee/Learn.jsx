import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { contentApi } from "../../api/content";
import "./Learn.css";

export default function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Determine if we're on the public or employee route
  const isPublicRoute = location.pathname.startsWith('/learn');

  
  const typeChips = [
    { label: "All", value: "" },
    { label: "Videos", value: "youtube" },
    { label: "Documents", value: "pdf" },
    { label: "Articles", value: "blog" },
    { label: "Write-ups", value: "writeup" },
    { label: "Posters", value: "poster" },
  ];

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
      case "poster":
        return "🖼️";
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
      case "poster":
        return "#0ea5e9";
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
            {isPublicRoute 
              ? "Explore our comprehensive collection of cybersecurity educational materials, videos, and resources. Learn about security best practices, threat awareness, and protection strategies."
              : "Welcome to our learning hub! Here you can access educational materials, videos, and resources to improve your cybersecurity knowledge."
            }
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
          <div className="filter-chips" aria-label="Filter by type">
            {typeChips.map((chip) => (
              <button
                key={chip.value || "all"}
                className={`chip ${filterType === chip.value ? "active" : ""}`}
                onClick={() => setFilterType(chip.value)}
                type="button"
                aria-pressed={filterType === chip.value}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <div className="learn-results-meta">
            <span className="results-count">
              Showing {filteredContent.length} {filteredContent.length === 1 ? "result" : "results"}
            </span>
          </div>
        )}

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
              {(item.posterImage || item.bannerImage) ? (
                <div className="content-media">
                  <img
                    src={item.posterImage || item.bannerImage}
                    alt={item.title}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="content-media placeholder">
                  <span className="placeholder-icon" style={{ backgroundColor: getTypeColor(item.type) }}>
                    {getTypeIcon(item.type)}
                  </span>
                </div>
              )}
              <div className="content-card-header">
                <div className="content-type-badge" style={{ backgroundColor: getTypeColor(item.type) }}>
                  <span className="type-icon">{getTypeIcon(item.type)}</span>
                  <span className="type-text">{item.type}</span>
                </div>
                <div className="content-date">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                  {(item.publishedAt || item.createdAt) && (Date.now() - new Date(item.publishedAt || item.createdAt).getTime()) < (14 * 24 * 60 * 60 * 1000) && (
                    <span className="new-badge" title="Recently published">New</span>
                  )}
                </div>
              </div>
              
              <div className="content-card-body">
                <h3 className="content-title">{item.title}</h3>
                <p className="content-description">{item.description}</p>
                {item.topic && (
                  <div className="topic-badge">{item.topic}</div>
                )}
                {(Array.isArray(item.tags) && item.tags.length > 0) && (
                  <div className="content-flags">
                    {item.tags.includes('required') && (
                      <span className="flag-badge required" title="Required module">Required</span>
                    )}
                    {item.tags.includes('recommended') && (
                      <span className="flag-badge recommended" title="Recommended module">Recommended</span>
                    )}
                  </div>
                )}
                
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
                  onClick={() => navigate(isPublicRoute ? `/content/${item._id || item.id}` : `/employee/learn/${item._id || item.id}`)}
                  className="learn-btn"
                  aria-label={`Start ${item.title}`}
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
