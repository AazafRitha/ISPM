import React, { useEffect, useMemo, useState } from "react";
import "./AdminProfile.css";
import { getAdminProfile, updateAdminProfile } from "../../services/adminApi";
import placeholderAvatar from "../../assets/admin/placeholder-avatar.svg";

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", nic: "", email: "", password: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const p = await getAdminProfile();
        if (!isMounted) return;
        setForm({ name: p.name || "", nic: p.nic || "", email: p.email || "", password: "" });
        setPhotoUrl(p.photoUrl || "");
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const [tempUrl, setTempUrl] = useState("");
  useEffect(() => {
    if (!photoFile) { setTempUrl(""); return; }
    const u = URL.createObjectURL(photoFile);
    setTempUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photoFile]);
  const previewSrc = tempUrl || photoUrl || placeholderAvatar;

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function onPickPhoto(e) {
    const f = e.target.files?.[0];
    if (f) setPhotoFile(f);
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password
      if (photoFile) payload.photo = photoFile;
      const res = await updateAdminProfile(payload);
      setSuccess("Profile updated successfully");
      setPhotoUrl(res.photoUrl || photoUrl);
      setForm(f => ({ ...f, password: "" }));
      setPhotoFile(null);
    } catch (e) {
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-profile"><p>Loading profile...</p></div>;

  return (
    <div className="admin-profile">
      <h1 className="title">Admin Profile</h1>
      <form className="profile-form" onSubmit={onSave}>
        <div className="photo-section">
          <div className="avatar">
            <img src={previewSrc} alt="Admin avatar" onError={(e) => { e.currentTarget.src = placeholderAvatar; }} />
          </div>
          <label className="file-button">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickPhoto} hidden />
            Choose Photo
          </label>
        </div>

        <div className="fields">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={onChange} placeholder="Admin name" />
          </div>
          <div className="field">
            <label htmlFor="nic">NIC Number</label>
            <input id="nic" name="nic" type="text" value={form.nic} onChange={onChange} placeholder="NIC number" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="email@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep current" />
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
}
