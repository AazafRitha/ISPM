// Author: Aazaf Ritha
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const quizApi = {
  async list({ status, q } = {}) {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (q) qs.set("q", q);
    const res = await fetch(`${BASE}/quizzes${qs.toString() ? `?${qs}` : ""}`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to load quizzes");
    const data = await res.json();
    return data; // Direct JSON response
  },

  async getOne(id) {
    const res = await fetch(`${BASE}/quizzes/${id}`, { headers: { ...authHeader() } });
    if (!res.ok) throw new Error("Failed to load quiz");
    const data = await res.json();
    return data; // Direct JSON response
  },

  async create(payload) {
    const res = await fetch(`${BASE}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Create failed");
    return data;
  },

  async update(id, payload) {
    const res = await fetch(`${BASE}/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Update failed");
    return data;
  },

  async remove(id) {
    const res = await fetch(`${BASE}/quizzes/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Delete failed");
    const data = await res.json();
    return data;
  },

  async publish(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/publish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Publish failed");
    return data;
  },

  async unpublish(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/unpublish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Unpublish failed");
    return data;
  },

  async duplicate(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/duplicate`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Duplicate failed");
    return data;
  }
};
