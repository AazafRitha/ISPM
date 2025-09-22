// Author: Aazaf Ritha
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function parseOrEmpty(res) {
  try {
    return await res.json();
  } catch (_) {
    return {};
  }
}

function throwHttpError(res, data, fallbackMessage) {
  const err = new Error(data?.error || data?.message || fallbackMessage);
  err.status = res.status;
  err.data = data;
  err.url = res.url;
  throw err;
}

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
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Failed to load quizzes");
    return data; // Direct JSON response
  },

  async getOne(id) {
    const res = await fetch(`${BASE}/quizzes/${id}`, { headers: { ...authHeader() } });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Failed to load quiz");
    return data; // Direct JSON response
  },

  async create(payload) {
    const res = await fetch(`${BASE}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Create failed");
    return data;
  },

  async update(id, payload) {
    const res = await fetch(`${BASE}/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Update failed");
    return data;
  },

  async remove(id) {
    const res = await fetch(`${BASE}/quizzes/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Delete failed");
    return data;
  },

  async publish(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/publish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Publish failed");
    return data;
  },

  async unpublish(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/unpublish`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Unpublish failed");
    return data;
  },

  async duplicate(id) {
    const res = await fetch(`${BASE}/quizzes/${id}/duplicate`, {
      method: "POST",
      headers: { ...authHeader() },
    });
    const data = await parseOrEmpty(res);
    if (!res.ok) throwHttpError(res, data, "Duplicate failed");
    return data;
  }
};
