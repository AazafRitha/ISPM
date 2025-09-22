// Author: Aazaf Ritha
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const policyApi = {
  async list() {
    const res = await fetch(`${BASE}/policies`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to load policies");
    const data = await res.json();
    return data;
  },

  async getOne(id) {
    const res = await fetch(`${BASE}/policies/${id}`, { 
      headers: { ...authHeader() } 
    });
    if (!res.ok) throw new Error("Failed to load policy");
    const data = await res.json();
    return data;
  },

  async create(policyData) {
    const formData = new FormData();
    formData.append('title', policyData.title);
    formData.append('description', policyData.description);
    formData.append('version', policyData.version);
    formData.append('category', policyData.category);
    formData.append('isRequired', policyData.isRequired);
    if (policyData.file) {
      formData.append('file', policyData.file);
    }

    const res = await fetch(`${BASE}/policies`, {
      method: 'POST',
      headers: { ...authHeader() },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to create policy");
    const data = await res.json();
    return data;
  },

  async update(id, policyData) {
    const formData = new FormData();
    formData.append('title', policyData.title);
    formData.append('description', policyData.description);
    formData.append('version', policyData.version);
    formData.append('category', policyData.category);
    formData.append('isRequired', policyData.isRequired);
    if (policyData.file) {
      formData.append('file', policyData.file);
    }

    const res = await fetch(`${BASE}/policies/${id}`, {
      method: 'PUT',
      headers: { ...authHeader() },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to update policy");
    const data = await res.json();
    return data;
  },

  async delete(id) {
    const res = await fetch(`${BASE}/policies/${id}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to delete policy");
    return true;
  },

  async download(id) {
    const res = await fetch(`${BASE}/policies/${id}/download`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to download policy");
    return res.blob();
  }
};
