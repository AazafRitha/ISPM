// Author: Aazaf Ritha
import { useEffect, useMemo, useRef, useState } from "react";
import { contentApi } from "../../api/content";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/AdminContentManage.css";

function YouTubeEmbed({ url }) {
  try {
    const id = (url || "").match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
    if (!id) return null;
    return (
      <iframe
        className="ac-video"
        src={`https://www.youtube.com/embed/${id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } catch {
    return null;
  }
}

export default function ContentEdit() {
  const nav = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [bannerUploading, setBannerUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setItem(await contentApi.getOne(id));
      } catch (e) {
        alert(e.message);
      }
    })();
  }, [id]);

  const canSave = useMemo(() => {
    if (!item) return false;
    if (!item.title?.trim()) return false;
    if (
      (item.type === "youtube" || item.type === "pdf") &&
      !item.url?.trim()
    )
      return false;
    if (
      (item.type === "blog" || item.type === "writeup") &&
      !item.body?.trim()
    )
      return false;
    return true;
  }, [item]);

  async function replaceBanner(file) {
    if (!file) return;
    setBannerUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      setItem((i) => ({ ...i, bannerImage: data.url }));
    } catch (e) {
      alert(e.message || "Banner upload failed");
    } finally {
      setBannerUploading(false);
    }
  }

  async function insertInlineImg(file) {
    if (!file) return;
    setImgUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      const md = `![image](${data.url})`;
      const el = bodyRef.current;
      setItem((i) => {
        const b = i.body || "";
        if (el) {
          const start = el.selectionStart ?? b.length;
          const end = el.selectionEnd ?? b.length;
          const next = b.slice(0, start) + md + b.slice(end);
          setTimeout(() => {
            el.focus();
            el.selectionStart = el.selectionEnd = start + md.length;
          }, 0);
          return { ...i, body: next };
        }
        return { ...i, body: b + "\n" + md };
      });
    } catch (e) {
      alert(e.message || "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  }

  const save = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await contentApi.update(id, item);
      alert("Saved");
      nav("/admin/content");
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!item)
    return (
      <div className="content-edit">
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );

  return (
    <div className="content-edit">
      <div className="page-topbar">
        <button className="btn btn-outline" onClick={() => nav("/admin/content")}>
          Back
        </button>
      </div>

      <div className="ac-wrapper">
        <div className="ac-toolbar">
          <h2 className="ac-title">Edit Content</h2>
          <div className="ac-actions">
            {item.status === "draft" ? (
              <button
                className="btn btn-success"
                onClick={async () => {
                  await contentApi.publish(id);
                  alert("Published");
                  nav("/admin/content");
                }}
              >
                Publish
              </button>
            ) : (
              <button
                className="btn btn-outline"
                onClick={async () => {
                  await contentApi.unpublish(id);
                  alert("Unpublished");
                  nav("/admin/content");
                }}
              >
                Unpublish
              </button>
            )}
            <button
              className="btn btn-primary"
              disabled={!canSave || saving}
              onClick={save}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="ac-card">
          <div className="ac-field">
            <label className="ac-label">Banner image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => replaceBanner(e.target.files?.[0])}
            />
            {bannerUploading && (
              <div className="ac-hint">Uploading…</div>
            )}
            {item.bannerImage && (
              <img
                src={item.bannerImage}
                alt="banner"
                className="ac-banner"
              />
            )}
          </div>
        </div>

        <div className="ac-grid">
          <div className="ac-field">
            <label className="ac-label">Title</label>
            <input
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              className="ac-input"
            />
          </div>

          <div className="ac-field">
            <label className="ac-label">Type</label>
            <select
              value={item.type}
              onChange={(e) => setItem({ ...item, type: e.target.value })}
              className="ac-select"
            >
              <option value="youtube">YouTube</option>
              <option value="pdf">PDF</option>
              <option value="blog">Blog</option>
              <option value="writeup">Write-up</option>
            </select>
          </div>

          <div className="ac-field ac-col-2">
            <label className="ac-label">Description</label>
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
              className="ac-textarea"
            />
          </div>

          {(item.type === "youtube" || item.type === "pdf") && (
            <div className="ac-field ac-col-2">
              <label className="ac-label">
                {item.type === "youtube" ? "YouTube URL" : "PDF URL"}
              </label>
              <input
                value={item.url || ""}
                onChange={(e) => setItem({ ...item, url: e.target.value })}
                className="ac-input"
              />
            </div>
          )}

          {(item.type === "blog" || item.type === "writeup") && (
            <div className="ac-field ac-col-2">
              <div className="ac-field-head">
                <span className="ac-label">Content (Markdown)</span>
                <label className="ac-insert">
                  Insert image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="ac-insert-input"
                    onChange={(e) => insertInlineImg(e.target.files?.[0])}
                  />
                </label>
              </div>
              {imgUploading && (
                <div className="ac-hint">Uploading image…</div>
              )}
              <textarea
                ref={bodyRef}
                rows={12}
                value={item.body || ""}
                onChange={(e) => setItem({ ...item, body: e.target.value })}
                className="ac-textarea"
              />
            </div>
          )}

          <div className="ac-field ac-col-2">
            <label className="ac-label">Tags (comma separated)</label>
            <input
              value={(item.tags || []).join(", ")}
              onChange={(e) =>
                setItem({
                  ...item,
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="ac-input"
            />
          </div>
        </div>

        {item.type === "youtube" && item.url && (
          <div className="ac-preview">
            <span className="ac-label">Preview</span>
            <div className="ac-video-wrap">
              <YouTubeEmbed url={item.url} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
