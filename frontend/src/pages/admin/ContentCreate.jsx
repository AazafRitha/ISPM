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

export default function ContentCreate() {
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("blog");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const bodyRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty = useMemo(() => {
    if (title.trim() || description.trim() || tags.trim()) return true;
    if (type === "youtube" || type === "pdf")
      return !!url.trim() || !!bannerPreview || !!bannerImage;
    return !!body.trim() || !!bannerPreview || !!bannerImage;
  }, [title, description, tags, type, url, body, bannerPreview, bannerImage]);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (type === "youtube" || type === "pdf") return !!url.trim();
    return !!body.trim();
  }, [title, type, url, body]);

  async function handleBannerChoose(file) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setBannerPreview(localUrl);
    setBannerUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      setBannerImage(data.url);
    } catch (e) {
      alert(e.message || "Banner upload failed");
    } finally {
      setBannerUploading(false);
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000);
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
    if (!canSave) return;
    try {
      const item = await contentApi.create({
        title,
        type,
        description,
        url,
        body,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        bannerImage: bannerImage || bannerPreview,
      });
      if (publish) await contentApi.publish(item._id || item.id);
      alert(publish ? "Published!" : "Saved draft");
      nav("/admin/content");
    } catch (e) {
      alert(e.message || "Save failed");
    }
  };

  const handleBack = () => {
    if (!dirty) nav("/admin/content");
    else setConfirmOpen(true);
  };

  return (
    <div className="content-create-page">
      {/* Top Header Bar */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Content Creation Header */}
      <div className="content-header">
        <div className="content-header-left">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
        </div>
        <div className="content-header-center">
          <h1 className="content-main-title">Create New Content</h1>
          <p className="content-subtitle">Build engaging educational content.</p>
        </div>
        <div className="content-header-actions">
          <button className="preview-btn">
            <span className="btn-icon">👁️</span>
            Preview
          </button>
          <button 
            className="save-draft-btn"
            disabled={!canSave}
            onClick={() => saveDraft(false)}
          >
            <span className="btn-icon">📄</span>
            Save Draft
          </button>
          <button 
            className="publish-btn"
            disabled={!canSave}
            onClick={() => saveDraft(true)}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
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
              <label className="form-label">Banner Image URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleBannerChoose(e.target.files?.[0])}
                className="file-input"
              />
              {bannerUploading && <div className="upload-status">Uploading...</div>}
              {(bannerPreview || bannerImage) && (
                <img
                  src={bannerImage || bannerPreview}
                  alt="Banner preview"
                  className="banner-preview"
                />
              )}
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
          </div>

          {/* Content Body Section */}
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
        </div>

        {/* Side Panel */}
        <div className="content-right">
          {/* Resources Section */}
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
      {type === "youtube" && url && (
        <div className="preview-section">
          <h3 className="preview-title">Preview</h3>
          <div className="preview-video-container">
            <YouTubeEmbed url={url} />
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
