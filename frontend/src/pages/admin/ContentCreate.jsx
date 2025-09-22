// Author: Aazaf Ritha
import { useMemo, useRef, useState } from "react";
import { contentApi } from "../../api/content";
import { useNavigate } from "react-router-dom";
import "./ContentCreate.css";

function YouTubeEmbed({ url }) {
  try {
    const id = (url || "").match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
    if (!id) return null;
    return (
      <iframe
        className="preview-video"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } catch {
    return null;
  }
}

function PreviewModal({ item, onClose }) {
  if (!item) return null;
  const hasBanner = false; // banner removed
  const isYouTube = item.type === "youtube" && !!item.url;
  const isPdf = item.type === "pdf" && !!item.url;
  const isPoster = item.type === "poster" && !!item.posterImage;
  const isText = item.type === "blog" || item.type === "writeup";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{maxWidth: 720}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
          <div>
            <h3 className="modal-title">Preview: {item.title}</h3>
            <p className="modal-text">Type: {item.type}</p>
          </div>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          {/* banner removed */}
          {item.description && (
            <p style={{color:'#374151',marginBottom:12}}>{item.description}</p>
          )}
          {isYouTube && (
            <div className="preview-video-container"><YouTubeEmbed url={item.url} /></div>
          )}
          {isPdf && (
            <div style={{marginTop:8}}>
              <a href={item.url} target="_blank" rel="noreferrer">Open PDF in new tab</a>
            </div>
          )}
          {isPoster && (
            <div className="poster-preview-container">
              <img src={item.posterImage} alt="poster" className="poster-preview" />
            </div>
          )}
          {isText && (
            <pre style={{whiteSpace:'pre-wrap',background:'#f9fafb',padding:12,borderRadius:8,border:'1px solid #e5e7eb'}}>
              {item.body || "(no content)"}
            </pre>
          )}
        </div>
        <div className="modal-actions" style={{marginTop:12,justifyContent:'flex-end'}}>
          <button className="btn btn-outline" onClick={onClose}>Looks good</button>
        </div>
      </div>
    </div>
  );
}

export default function ContentCreate() {
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("blog");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [topic, setTopic] = useState("");
  // Banner removed per requirements
  const [posterImage, setPosterImage] = useState("");
  const [posterPreview, setPosterPreview] = useState("");
  const [posterUploading, setPosterUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const bodyRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOf, setPreviewOf] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState("");

  const dirty = useMemo(() => {
    if (title.trim() || description.trim() || tags.trim() || topic.trim() || posterImage || posterPreview) return true;
    if (type === "youtube" || type === "pdf")
      return !!url.trim();
    if (type === "poster")
      return !!posterImage || !!posterPreview;
    return !!body.trim();
  }, [title, description, tags, topic, posterImage, posterPreview, type, url, body]);

  // Allow saving drafts with minimal fields (title + type)
  const canSaveDraft = useMemo(() => {
    return !!title.trim() && !!type;
  }, [title, type]);

  // Publishing requires full validations by type
  const canPublish = useMemo(() => {
    if (!canSaveDraft) return false;
    if (type === "youtube" || type === "pdf") return !!url.trim();
    if (type === "poster") return !!(posterImage || posterPreview);
    return !!body.trim();
  }, [canSaveDraft, type, url, body, posterImage, posterPreview]);

  const validationIssues = useMemo(() => {
    const issues = [];
    if (!title.trim()) issues.push("Title is required");
    if (!type) issues.push("Type is required");
    if (type === "youtube" || type === "pdf") {
      if (!url.trim()) issues.push("URL is required for this type");
    }
    if (type === "poster") {
      if (!(posterImage || posterPreview)) issues.push("Poster image is required for Poster type");
    }
    if (type === "blog" || type === "writeup") {
      if (!body.trim()) issues.push("Body content is required for text types");
    }
    return issues;
  }, [title, type, url, posterImage, posterPreview, body]);

  const isBlobUrl = (u) => typeof u === 'string' && u.startsWith('blob:');
  const draft = useMemo(() => ({
    title,
    type,
    description,
    url,
    body,
    topic,
    posterImage: isBlobUrl(posterImage) ? '' : (posterImage || ''),
    tags: tags.split(",").map(s=>s.trim()).filter(Boolean)
  }), [title, type, description, url, body, topic, posterImage, tags]);


  // Banner upload removed

  async function handlePosterUpload(file) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPosterPreview(localUrl);
    setPosterUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      setPosterImage(data.url);
    } catch (e) {
      // Keep local preview visible even if upload failed
      alert(e.message || "Poster upload failed. Preview will still show locally.");
    } finally {
      setPosterUploading(false);
    }
  }

  async function handlePdfChoose(file) {
    if (!file) return;
    setPdfUploading(true);
    try {
      const data = await contentApi.uploadPdf(file);
      setUrl(data.url);
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setPdfUploading(false);
    }
  }

  async function handleInlineImage(file) {
    if (!file) return;
    setImgUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      const md = `![image](${data.url})`;
      const el = bodyRef.current;
      if (el) {
        const start = el.selectionStart ?? body.length;
        const end = el.selectionEnd ?? body.length;
        const next = body.slice(0, start) + md + body.slice(end);
        setBody(next);
        setTimeout(() => {
          el.focus();
          el.selectionStart = el.selectionEnd = start + md.length;
        }, 0);
      } else {
        setBody((b) => b + "\n" + md);
      }
    } catch (e) {
      alert(e.message || "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  }

  const saveDraft = async (publish = false) => {
    // Guard based on the correct validation set
    if (publish ? !canPublish : !canSaveDraft) return;
    try {
      setErrorMsg("");
      setSaving(true);
      const payload = {
        title,
        type,
        description,
        url,
        body,
        topic,
        posterImage: isBlobUrl(posterImage) ? '' : (posterImage || ''),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const item = await contentApi.create(payload);
      if (publish) await contentApi.publish(item._id || item.id);
      alert(publish ? "Published!" : "Saved draft");
      nav("/admin/content");
    } catch (e) {
      const msg = e?.message || "Save failed";
      setErrorMsg(msg);
      alert(msg);
    }
    finally { setSaving(false); }
  };

  const handleBack = () => {
    if (!dirty) nav("/admin/content");
    else setConfirmOpen(true);
  };

  return (
    <div className="content-create-page">
      {/* Top Header Bar (match QuizCreate) */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button 
            className="preview-btn"
            onClick={() => setPreviewOf(draft)}
            disabled={!canSaveDraft || saving}
            title={!canSaveDraft ? "Add a title and type to preview" : "Preview content"}
          >
            <span className="btn-icon">👁️</span>
            Preview
          </button>
          <button 
            className="save-draft-btn"
            disabled={!canSaveDraft || saving}
            onClick={() => saveDraft(false)}
            title={!canSaveDraft ? "Enter a title and type to save draft" : "Save as draft"}
          >
            <span className="btn-icon">💾</span>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button 
            className="publish-btn"
            disabled={!canPublish || saving}
            onClick={() => saveDraft(true)}
            title={!canPublish ? "Fill required fields before publishing" : "Publish this content"}
          >
            {saving ? "Publishing…" : "Publish"}
          </button>
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
          {/* Header Section (match QuizCreate) */}
          <div className="content-header-section">
            <button className="back-btn" onClick={handleBack}>← Back</button>
            <div className="header-content">
              <h1 className="content-main-title">Create New Educational Content</h1>
              <p className="content-subtitle">Build engaging educational content for employee training and development.</p>
            </div>
          </div>
          {errorMsg && (
            <div className="content-section" style={{border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b'}}>
              <strong>Action failed:</strong> {errorMsg}
            </div>
          )}
          {/* Basic Information Section */}
          <div className="content-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="form-group">
              <label className="form-label required">Content Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter content title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>


            <div className="form-group">
              <label className="form-label required">Content Type *</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select content type.</option>
                <option value="youtube">YouTube Video</option>
                <option value="pdf">PDF Document</option>
                <option value="blog">Blog Post</option>
                <option value="writeup">Write-up</option>
                <option value="poster">Poster</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Brief description of your content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Topic</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Cybersecurity Fundamentals, Phishing Awareness, Password Security"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Banner removed */}

            {type === "poster" && (
              <div className="form-group">
                <label className="form-label required">Poster Image *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/poster.jpg"
                  value={posterImage}
                  onChange={(e) => setPosterImage(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handlePosterUpload(e.target.files?.[0])}
                  className="file-input"
                />
                {posterUploading && <div className="upload-status">Uploading poster...</div>}
                {(posterPreview || posterImage) && (
                  <div className="poster-preview-container">
                    <img
                      src={posterImage || posterPreview}
                      alt="Poster preview"
                      className="poster-preview"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const container = e.currentTarget.parentElement;
                        if (!container.querySelector('.banner-error')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'banner-error';
                          errorDiv.textContent = 'Failed to load image preview';
                          container.appendChild(errorDiv);
                        }
                      }}
                      onClick={() => setLightboxSrc(posterImage || posterPreview)}
                      style={{ cursor: 'zoom-in' }}
                    />
                    <div style={{ marginTop: 6 }}>
                      <button type="button" className="btn btn-outline" onClick={() => setLightboxSrc(posterImage || posterPreview)}>
                        View full size
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content Body Section */}
          {type !== "poster" && (
            <div className="content-section">
              <h2 className="section-title">Content Body</h2>
              
              {(type === "blog" || type === "writeup") && (
              <div className="form-group">
                <textarea
                  ref={bodyRef}
                  className="form-textarea large"
                  rows="12"
                  placeholder="Write your content here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                {imgUploading && <div className="upload-status">Uploading image...</div>}
                <label className="image-upload-label">
                  Insert image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="image-upload-input"
                    onChange={(e) => handleInlineImage(e.target.files?.[0])}
                  />
                </label>
              </div>
            )}

            {(type === "youtube" || type === "pdf") && (
              <div className="form-group">
                <label className="form-label">
                  {type === "youtube" ? "YouTube URL" : "PDF URL"}
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {type === "pdf" && (
                  <>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePdfChoose(e.target.files?.[0])}
                      className="file-input"
                    />
                    {pdfUploading && <div className="upload-status">Uploading PDF...</div>}
                  </>
                )}
              </div>
            )}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="content-right">
          {/* Validation Issues */}
          {validationIssues.length > 0 && (
            <div className="content-section">
              <h2 className="section-title" style={{color:'#e74c3c'}}>Validation</h2>
              <ul style={{color:'#e74c3c', fontSize:'0.9rem', margin:0, paddingLeft:'1.2rem'}}>
                {validationIssues.map((v, i) => (
                  <li key={i} style={{marginBottom:4}}>{v}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Resources Section */}
          {type !== "poster" && (
            <div className="content-section">
              <h2 className="section-title">Resources</h2>
              
              <div className="form-group">
                <select className="form-select">
                  <option>External Link</option>
                  <option>File Upload</option>
                  <option>Video</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource title</label>
                <input type="text" className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">URL</label>
                <input type="url" className="form-input" />
              </div>

              <button className="add-resource-btn">
                <span className="btn-icon">+</span>
                Add Resource
              </button>
            </div>
          )}

          {/* Tags Section */}
          <div className="content-section">
            <h2 className="section-title">Tags</h2>
            
            <div className="tags-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Add tag."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <button className="add-tag-btn">
                <span className="btn-icon">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal item={previewOf} onClose={() => setPreviewOf(null)} />

      {/* Image Lightbox */}
      {lightboxSrc && (
        <div className="modal-overlay" onClick={() => setLightboxSrc("")}>
          <div className="image-lightbox" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxSrc} alt="Full preview" className="image-lightbox-img" />
            <button className="close-btn" onClick={() => setLightboxSrc("")}>Close</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Leave without saving?</h3>
            <p className="modal-text">
              You have unsaved changes. Save as draft, discard, or cancel.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setConfirmOpen(false);
                  saveDraft(false);
                }}
              >
                Save Draft
              </button>
              <button
                className="btn btn-danger"
                onClick={() => nav("/admin/content")}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
