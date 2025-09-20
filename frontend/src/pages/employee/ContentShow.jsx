// Author: Aazaf Ritha
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentApi } from "../../api/content";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./ContentShow.css";

export default function ContentShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      if (!id) {
        setError("No content ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await contentApi.getOne(id);
        setContent(data);
      } catch (err) {
        setError(err.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id]);

  const renderContent = () => {
    if (!content) return null;

    switch (content.type) {
      case "youtube":
        return (
          <div className="content-youtube">
            <iframe
              width="100%"
              height="400"
              src={content.url}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      case "pdf":
        return (
          <div className="content-pdf">
            <iframe
              src={content.url}
              width="100%"
              height="600"
              title={content.title}
            ></iframe>
          </div>
        );
      case "blog":
      case "writeup":
      default:
        return (
          <div className="content-text">
            <div dangerouslySetInnerHTML={{ __html: content.body }} />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="content-show">
        <Header />
        <div className="content-container">
          <div className="loading">Loading content...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-show">
        <Header />
        <div className="content-container">
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

  if (!content) {
    return (
      <div className="content-show">
        <Header />
        <div className="content-container">
          <div className="not-found">
            <h2>Content Not Found</h2>
            <p>The requested content could not be found.</p>
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
    <div className="content-show">
      <Header />
      <div className="content-container">
        <div className="content-header">
          <button 
            onClick={() => navigate("/employee/learn")} 
            className="back-btn"
          >
            ← Back to Learning
          </button>
          <div className="content-meta">
            <span className="content-type">{content.type}</span>
            <span className="content-status">{content.status}</span>
            {content.publishedAt && (
              <span className="content-date">
                Published: {new Date(content.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <article className="content-article">
          {content.bannerImage && (
            <div className="content-banner">
              <img 
                src={content.bannerImage} 
                alt={content.title}
                className="banner-image"
              />
              <div className="banner-overlay"></div>
            </div>
          )}
          <header className="content-title-section">
            <h1 className="content-title">{content.title}</h1>
            {content.description && (
              <p className="content-description">{content.description}</p>
            )}
          </header>

          <div className="content-body">
            {renderContent()}
          </div>

          {content.tags && content.tags.length > 0 && (
            <div className="content-tags">
              <h3>Tags:</h3>
              <div className="tags-list">
                {content.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      <Footer />
    </div>
  );
}
