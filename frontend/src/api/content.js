// Author: Aazaf Ritha
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const contentApi = {
  async list({ status, q, type } = {}) {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (q) qs.set("q", q);
    if (type) qs.set("type", type);
    const res = await fetch(`${BASE}/content${qs.toString() ? `?${qs}` : ""}`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to load content");
    const data = await res.json();
    return data; // Direct JSON response
  },

  async getOne(id) {
    const res = await fetch(`${BASE}/content/${id}`, { headers: { ...authHeader() } });
    if (!res.ok) throw new Error("Failed to load item");
    const data = await res.json();
    return data; // Direct JSON response
  },

  async create(payload) {
    const res = await fetch(`${BASE}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Create failed");
    return data.data || data;
  },

  async update(id, payload) {
    const res = await fetch(`${BASE}/content/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Update failed");
    return data.data || data;
  },

  async remove(id) {
    const res = await fetch(`${BASE}/content/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Delete failed");
    const data = await res.json();
    return data.data || data;
  },

  async publish(id) {
    const res = await fetch(`${BASE}/content/${id}/publish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Publish failed");
    return data.data || data;
  },

  async unpublish(id) {
    const res = await fetch(`${BASE}/content/${id}/unpublish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Unpublish failed");
    return data.data || data;
  },

  // Upload PDF -> { url, filename, ... }
  async uploadPdf(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/content/upload/pdf`, {
      method: "POST",
      headers: { ...authHeader() },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
    return data.data || data;
  },

  // Upload Image (jpg/png/webp) -> { url, filename, ... }
  async uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/content/upload/image`, {
      method: "POST",
      headers: { ...authHeader() },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
    return data.data || data;
  },
};
